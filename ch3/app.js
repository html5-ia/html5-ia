(function() {
    var SuperEditor = function() {
        var view,
            fileName,
            isDirty = false,
            unsavedMsg = 'Unsaved changes will be lost. Are you sure?',
            unsavedTitle = 'Discard changes';
            
        var markDirty = function() {
            isDirty = true;
        };

        var markClean = function() {
            isDirty = false;
        };

        var checkDirty = function() {
            if(isDirty) {
                return unsavedMsg;
            }
        };
        
        //Ask user to confirm if they try to navigate away when changes have been made
        window.addEventListener('beforeunload', checkDirty, false);
        
        var jump = function(e) {
            var hash = location.hash;
                
            if(hash.indexOf('/') > -1) {
                var parts = hash.split('/'),
                    fileNameEl = document.getElementById('file_name');
                
                view = parts[0].substring(1);
                fileName = parts[1];                
                fileNameEl.innerHTML = fileName;
            } else {
                if(!isDirty || confirm(unsavedMsg, unsavedTitle)) {
                    markClean();
                    view = 'list';
                    if(hash != '#list') {
                        location.hash = '#list';
                    }
                } else {
                    location.href = e.oldURL;
                }
            }
            
            document.body.className = view;
        };
        
        //Call jump on page load
        jump();
        
        window.addEventListener('hashchange', jump, false);
        
        var editVisualButton = document.getElementById('edit_visual'),
            visualView = document.getElementById('file_contents_visual'),
            visualEditor = document.getElementById('file_contents_visual_editor'),
            visualEditorDoc = visualEditor.contentDocument,            
            editHtmlButton = document.getElementById('edit_html'),
            htmlView = document.getElementById('file_contents_html'),
            htmlEditor = document.getElementById('file_contents_html_editor');
            
        //Switch on editable mode for Visual editor iFrame
        visualEditorDoc.designMode = 'on';

        //Mark file as dirty when changes have been made
        visualEditorDoc.addEventListener('keyup', markDirty, false);
        htmlEditor.addEventListener('keyup', markDirty, false);
        
        /* Update the Visual editor content */
        var updateVisualEditor = function(content) {
            visualEditorDoc.open();
            visualEditorDoc.write(content);
            visualEditorDoc.close();
            /* Need to reattach event listener here */
            visualEditorDoc.addEventListener('keyup', markDirty, false);
        };
        
        /* Update the HTML editor content */
        var updateHtmlEditor = function(content) {
            htmlEditor.value = content;
        };
            
        /* Toggle whether Visual or HTML editor view is active */
        var toggleActiveView = function() {
            if(htmlView.style.display == 'block') {
                //HTML View is active
                editVisualButton.className = 'split_left active';
                visualView.style.display = 'block';
                editHtmlButton.className = 'split_right';
                htmlView.style.display = 'none';
                updateVisualEditor(htmlEditor.value);
            } else {
                //Visual View is active
                editHtmlButton.className = 'split_right active';
                htmlView.style.display = 'block';
                editVisualButton.className = 'split_left';
                visualView.style.display = 'none';
                
                //Get contents of visual editor using XMLSerializer
                var x = new XMLSerializer();
                var content = x.serializeToString(visualEditorDoc);
                updateHtmlEditor(content);
            }
        }
        
        editVisualButton.addEventListener('click', toggleActiveView, false);
        editHtmlButton.addEventListener('click', toggleActiveView, false);
        
        /* Rich-text commands */
        var visualEditorToolbar = document.getElementById('file_contents_visual_toolbar');
        
        var richTextAction = function(e) {
            var command,
                node = (e.target.nodeName === "BUTTON") ? e.target : e.target.parentNode;
                
            if(node.dataset) {
                command = node.dataset.command;
            } else {
                command = node.getAttribute('data-command');
            }
                
            var doPopupCommand = function(command, promptText, promptDefault) {
                visualEditorDoc.execCommand(command, false, prompt(promptText, promptDefault));
            }
            
            if(command === 'createLink') {
                doPopupCommand(command, 'Enter link URL:', 'http://www.example.com');
            } else if(command === 'insertImage') {
                doPopupCommand(command, 'Enter image URL:', 'http://www.example.com/image.png');
            } else if(command === 'insertMap') {
                if(navigator.geolocation) {
                    node.innerHTML = 'Loading';
                    navigator.geolocation.getCurrentPosition(function(pos) {
                        var coords = pos.coords.latitude+','+pos.coords.longitude;
                        var img = 'http://maps.googleapis.com/maps/api/staticmap?markers='
                            +coords+'&zoom=11&size=200x200&sensor=false';
                        visualEditorDoc.execCommand('insertImage', false, img);
                        node.innerHTML = 'Location Map';
                    });
                } else {
                    alert('Your browser does not support Geolocation', 'Unsupported Feature');
                }
            } else {
                visualEditorDoc.execCommand(command);
            }
        };
        
        visualEditorToolbar.addEventListener('click', richTextAction, false);
        
        /* File System API code starts here */
        window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem
            || window.mozRequestFileSystem || window.msRequestFileSystem || false;
        window.storageInfo = window.storageInfo || window.webkitStorageInfo
            || window.mozStorageInfo || window.msStorageInfo || false;
        window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder
            || window.MozBlobBuilder || window.MsBlobBuilder || false;
        
        var stType = window.PERSISTENT || 1,
            stSize = (5*1024*1024),
            fileSystem,
            fileListEl = document.getElementById('files'),
            currentFile;
            
        //Standard error message to display for all file system errors
        var fsError = function(e) {
            if(e.code === 9) {
                alert('A file with that name already exists.', 'File System Error');
            } else {
                alert('An unexpected file system error occured. Error code: '+e.code);
            }
        };        
        
        
        if(requestFileSystem && storageInfo) {
            //Check persistent storage area quota, request one if needed
            var checkQuota = function(currentUsage, quota) {
                if(quota === 0) {
                    storageInfo.requestQuota(stType, stSize, getFS, fsError);
                } else {
                    getFS(quota);
                }
            };
            
            storageInfo.queryUsageAndQuota(stType, checkQuota, fsError);            

            //Request access to sandboxed local file system
            var getFS = function(quota) {
                requestFileSystem(stType, quota, setupFileSystem, fsError);
            }
            var setupFileSystem = function(fs) {
                fileSystem = fs;
                getFilesList();
                if(view === 'editor') {
                    loadFile(fileName);
                }
            }
            
            var displayFileList = function(files) {
                fileListEl.innerHTML = '';
                //Update file count display
                document.getElementById('file_count').innerHTML = files.length;
                if(files.length > 0) {                    
                    /* Display each file in the file system */
                    files.forEach(function(file, i) {
                        var li = '<li id="li_'+i+'" draggable="true">'+file.name
                            + '<div><button id="view_'+i+'">View</button>'
                            + '<button class="green" id="edit_'+i+'">Edit</button>'
                            + '<button class="red" id="del_'+i+'">Delete</button>'
                            + '</div></li>';
                        fileListEl.insertAdjacentHTML('beforeend', li);
                        
                        /* Add event handlers to each button in list */
                        var listItem = document.getElementById('li_'+i),
                            viewBtn = document.getElementById('view_'+i),
                            editBtn = document.getElementById('edit_'+i),
                            deleteBtn = document.getElementById('del_'+i);
                            
                        var doDrag = function(e) { dragFile(file, e); }                            
                        var doView = function() { viewFile(file); }
                        var doEdit = function() { editFile(file); }
                        var doDelete = function() { deleteFile(file); }
                        
                        listItem.addEventListener('dragstart', doDrag, false);
                        viewBtn.addEventListener('click', doView, false);
                        editBtn.addEventListener('click', doEdit, false);
                        deleteBtn.addEventListener('click', doDelete, false);
                    });
                } else {
                    fileListEl.innerHTML = '<li class="empty">No files to display</li>'
                }
            };
            
            /* Load files list */
            var getFilesList = function() {
                /* Create a directory reader to list files */
                var dirReader = fileSystem.root.createReader(),
                    files = [];                                

                /* Directory listing is read in chunks */
                var readFileList = function() {
                    dirReader.readEntries(function(results) {
                        if(!results.length) {
                            /* Display sorted files if at end of directory */
                            displayFileList(files.sort());
                        } else {
                            /* Push files to master list and iterate again */
                            for(var i=0,len=results.length;i<len;i++) {
                                files.push(results[i]);
                            }
                            readFileList();
                        }
                    }, fsError);
                }
                readFileList();
            };
            
            /* Load a file from the file system and display it */
            var loadFile = function(name) {
                fileSystem.root.getFile(name, {}, function(file) {
                    currentFile = file;
                    file.file(function(f) {                    
                        var reader = new FileReader();
                        reader.onloadend = function(e) {
                            /* When the file finishes loading,
                               update the editors with its content */
                            updateVisualEditor(this.result);
                            updateHtmlEditor(this.result);
                        }
                        reader.readAsText(f);
                    }, fsError);
                }, fsError);
            }
            
            /* View the file in a popup window */
            var viewFile = function(file) {
                window.open(file.toURL(), 'SuperEditorPreview', 'width=800,height=600');
            }
            
            /* Load the file in the Editor view */
            var editFile = function(file) {
                loadFile(file.name);
                location.href = '#editor/'+file.name;            
            }
            
            /* Delete the file */
            var deleteFile = function(file) {
                var deleteSuccess = function() {
                    alert('File '+file.name+' deleted successfully', 'File deleted');
                    getFilesList();
                }

                if(confirm('File will be deleted. Are you sure?', 'Confirm delete')) {
                    file.remove(deleteSuccess, fsError);
                }            
            }
            
            /* Create a new file in the file system */
            var createFile = function(field) {
                var config = {
                    create: true,
                    exclusive: true
                };

                var createSuccess = function(file) {
                    alert('File '+file.name+' created successfully', 'File created');
                    getFilesList();
                    field.value = '';
                }

                fileSystem.root.getFile(field.value, config, createSuccess, fsError);
            };

            /* Submit handler function, perform validation */
            var createFormSubmit = function(e) {
                e.preventDefault();
                var name = document.forms.create.name;
                if(name.value.length > 0) {
                    var len = name.value.length;
                    if(name.value.substring(len-5, len) === '.html') {
                        createFile(name);
                    } else {
                        alert('You may only create files with the extension .html', 'Create Error');
                    }
                } else {
                    alert('You must enter a file name', 'Create Error');
                }            
            };

            document.forms.create.addEventListener('submit', createFormSubmit, false);
            
            /* Import files by selecting from computer */
            var importFiles = function(files) {                
                var count = 0, validCount = 0;

                /* if all files have been checked, show list */
                var checkCount = function() {
                    count++;
                    if(count === files.length) {
                        var errorCount = count - validCount;
                        alert(validCount+' file(s) imported. '+errorCount+' error(s) encountered.', 'Import complete');
                        getFilesList();
                    }
                };

                /* Loop through user selected files */
                for(var i=0,len=files.length;i<len;i++) {
                    var file = files[i];

                    (function(f) {
                        var config = {create: true, exclusive: true};
                        if(f.type == 'text/html') {
                            fileSystem.root.getFile(f.name, config, function(theFile) {                        
                                theFile.createWriter(function(fw) {                            
                                    fw.write(f);
                                    validCount++;
                                    checkCount();
                                }, function(e) {                            
                                    checkCount();
                                });
                            }, function(e) {
                                checkCount();
                            });
                        } else {
                            checkCount();
                        }
                    })(file);
                }
            };

            /* Import form submit handler */
            var importFormSubmit = function(e) {
                e.preventDefault();
                var files = document.forms.import.files.files;
                if(files.length > 0) {
                    importFiles(files);
                } else {
                    alert('You must select at least one file to import', 'Import Error');
                }
            };

            document.forms.import.addEventListener('submit', importFormSubmit, false);       
            
            /* Save file in the file system */
            var saveFile = function(callback) {
                var currentView = function() {
                    if(htmlView.style.display === 'block') {
                        return 'html';
                    } else {
                        return 'editor';
                    }
                }

                var content;

                if(currentView() === 'editor') {
                    var x = new XMLSerializer();
                    content = x.serializeToString(visualEditorDoc);
                } else {
                    content = htmlEditor.value;
                }

                currentFile.createWriter(function(fw) {
                    fw.onwriteend = function(e) {
                        if(typeof callback === 'function') {
                            callback(currentFile);
                        } else {
                            alert('File saved successfully', 'File saved');
                        }
                        isDirty = false;
                    };

                    fw.onerror = fsError;

                    var blob = new BlobBuilder();
                    blob.append(content);
                    fw.write(blob.getBlob('text/plain'));
                }, fsError);
            };
            
            var previewFile = function() {
                saveFile(viewFile);
            };
            
            var saveBtn = document.getElementById('file_save');
            var previewBtn = document.getElementById('file_preview');
            
            saveBtn.addEventListener('click', saveFile, false);
            previewBtn.addEventListener('click', previewFile, false);
            
            /* Drag and drop file functionality */
            var fileDropZone = document.getElementById('filedrop');

            /* Drag from computer import */
            var importByDrop = function(e) {
                e.stopPropagation();
                e.preventDefault();

                var files = e.dataTransfer.files;
                if(files.length > 0) {
                    importFiles(files);
                }
            };

            var importDragOver = function(e) {
                e.preventDefault();
                e.dataTransfer.effectAllowed = 'copy';
                e.dataTransfer.dropEffect = 'copy';
                return false;
            };

            fileDropZone.addEventListener('drop', importByDrop, false);
            fileDropZone.addEventListener('dragover', importDragOver, false);

            /* Drag to computer export */
            var dragFile = function(file, e) {
                e.dataTransfer.effectAllowed = 'copy';
                e.dataTransfer.dropEffect = 'copy';
                e.dataTransfer.setData('DownloadURL', 'application/octet-stream:'+file.name+':'+file.toURL());
            };
        } else {
            alert('File System API not supported', 'Unsupported feature');
        }    
    };
    
    var init = function() {
        new SuperEditor();
    }
    
    window.addEventListener('load', init, false);
})();