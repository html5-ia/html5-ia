/* Wrap the entire app in a closure to prevent global namespace pollution */
(function() {
	var Tasks = function() {
		/* Hide browser toolbar on iOS devices */
		var nudge = function() {
			setTimeout(function() { window.scrollTo(0,0); }, 1000);
		}
		
		/* Display the view requested in the URL */
		var jump = function() {
			switch(location.hash) {
				case '#add':
					document.body.className = 'add';
					break;
				case '#settings':
					document.body.className = 'settings';
					break;
				default:
					document.body.className = 'list';
			}
			nudge();
		}
		
		/* Call jump on page load */
		jump();
		
		/* Switch views when the application URL changes */
		window.addEventListener('hashchange', jump, false);
		
		/* Hide browser toolbars on iOS devices when device orientation changes */
		window.addEventListener('orientationchange', nudge, false);
		
		/* Check if the browser supports HTML5 localStorage */
		var localStorageAvailable = ('localStorage' in window);
		
		/* Load settings from localStorage and update application */
		var loadSettings = function() {
			if(localStorageAvailable) {
				var name = localStorage.getItem('name'),
					colorScheme = localStorage.getItem('colorScheme'),
					nameDisplay = document.getElementById('user_name'),
					nameField = document.forms.settings.name,
					doc = document.documentElement,
					colorSchemeField = document.forms.settings.color_scheme;
					
				if(name) {
					nameDisplay.innerHTML = name+"'s";
					nameField.value = name;
				} else {
					nameDisplay.innerHTML = 'My';
					nameField.value = '';
				}
			
				if(colorScheme) {
					doc.className = colorScheme.toLowerCase();
					colorSchemeField.value = colorScheme;
				} else {
					doc.className = 'blue';
					colorSchemeField.value = 'Blue';
				}
			}
		}
		
		/* Save settings to localStorage and update application */
		var saveSettings = function(e) {
			e.preventDefault();
			if(localStorageAvailable) {
				var name = document.forms.settings.name.value;
				if(name.length > 0) {
					var colorScheme = document.forms.settings.color_scheme.value;
					
					localStorage.setItem('name', name);
					localStorage.setItem('colorScheme', colorScheme);
					
					loadSettings();
					alert('Settings saved successfully', 'Settings saved');
					location.hash = '#list';
				} else {
					alert('Please enter your name', 'Settings error');
				}
			} else {
				alert('Browser does not support localStorage', 'Settings error');
			}
		}
		
		/* Clear/reset settings from localStorage and reload defaults */
		var resetSettings = function(e) {
			e.preventDefault();
			if(confirm('This will remove all application data. Are you sure?', 'Confirm reset')) {
				if(localStorageAvailable) {
					localStorage.clear();
				}
		
				loadSettings();
				alert('Application data has been reset', 'Reset successful');
				location.hash = '#list';
		
				dropDatabase();
			}
		}
		
		/* Load settings on page load */
		loadSettings();

		/* Save settings data when Settings form is submit */
		document.forms.settings.addEventListener('submit', saveSettings, false);

		/* Reset all data when Settings form is reset */
		document.forms.settings.addEventListener('reset', resetSettings, false);
		
		/* Manage prefixes and database feature detection */
		var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB || false,
			IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.mozIDBTransaction || window.msIDBTransaction || false,
			IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.mozIDBKeyRange || window.msIDBKeyRange || false,
			webSQLSupport = ('openDatabase' in window),
			db;
			
		/* Open a connection to a database, initial DB setup */
		var openDB = function() {
			if(indexedDB) {
				/* Open IndexedDB database */
				var request = indexedDB.open('tasks', 1),
					upgradeNeeded = ('onupgradeneeded' in request);
			
				request.onsuccess = function(e) {
					db = e.target.result;
			
					if(!upgradeNeeded && db.version != '1') {
						/* Old method of creating object stores and indexes */
						var setVersionRequest = db.setVersion('1');
						setVersionRequest.onsuccess = function(e) {
							var objectStore = db.createObjectStore('tasks', { 
								keyPath: 'id' 
							});
							objectStore.createIndex('desc', 'descUpper', { 
								unique: false 
							});
							loadTasks();
						}
					} else {
						loadTasks();
					}
				}
				/* New method of creating object stores and indexes */
				if(upgradeNeeded) {
					request.onupgradeneeded = function(e) {
						db = e.target.result;
						var objectStore = db.createObjectStore('tasks', { 
							keyPath: 'id' 
						});
						objectStore.createIndex('desc', 'descUpper', { 
							unique: false 
						});
					}
				}
			} else if(webSQLSupport) {
				/* Open WebSQL database as fallback */
				db = openDatabase('tasks', '1.0', 'Tasks database', (5*1024*1024));
				db.transaction(function(tx) {
					var sql = 'CREATE TABLE IF NOT EXISTS tasks ('+
								'id INTEGER PRIMARY KEY ASC,'+
								'desc TEXT,'+
								'due DATETIME,'+
								'complete BOOLEAN'+
								')';
					tx.executeSql(sql, [], loadTasks);
				});
			}
		}

		/* Call openDB function on page load */
		openDB();
		
		/* If no tasks exist or a search returned zero results, show an empty message */
		var createEmptyItem = function(taskList) {
			var emptyItem = document.createElement('li');
			if(query.length > 0) {
				emptyItem.innerHTML = '<div class="item_title">'+
					'No tasks match your query <strong>'+query+'</strong>.'+
					'</div>';
			} else {
				emptyItem.innerHTML = '<div class="item_title">'+
					'No tasks to display. <a href="#add">Add one</a>?'+
					'</div>';
			}
			taskList.appendChild(emptyItem);
		}
		
		/* This code builds a new task row and adds it to the list */
		var showTask = function(task, list) {
			var newItem = document.createElement('li'),
				checked = (task.complete == 1) ? ' checked="checked"' : '';
	
			newItem.innerHTML = 
				'<div class="item_complete">'+
					'<input type="checkbox" name="item_complete" id="chk_'+task.id+'"'+checked+'>'+
				'</div>'+
				'<div class="item_delete"><a href="#" id="del_'+task.id+'">Delete</a></div>'+
				'<div class="item_title">'+task.desc+'</div>'+
				'<div class="item_due">'+task.due+'</div>';
			list.appendChild(newItem);
	
			/* Executed when a user checks or unchecks the complete checkbox for a task */
			var markAsComplete = function(e) {
				e.preventDefault();
				var updatedTask = {
					id: task.id,
					desc: task.desc,
					descUpper: task.desc.toUpperCase(),
					due: task.due,
					complete: e.target.checked
				};
				updateTask(updatedTask);
			}
	
			/* Executed when the user clicks the Delete button for a task */
			var remove = function(e) {
				e.preventDefault();
				if(confirm('The task will be deleted. Are you sure?', 'Confirm delete')) {
					deleteTask(task.id);
				}
			}
	
			/* Attach event handlers to the new task list item */
			document.getElementById('chk_'+task.id).onchange = markAsComplete;
			document.getElementById('del_'+task.id).onclick = remove;
		}
		
		/* Load existing tasks from the database and display them in the Task List view */
		var loadTasks = function(q) {
			/* This function is called for both showing all tasks and for searching */
			var taskList = document.getElementById('list'),
				query = q || '';
			/* Clear the task list */
			taskList.innerHTML = '';
	
			if(indexedDB) {
				/* IndexedDB uses cursors to read data from the database */
				var tx = db.transaction(['tasks'], IDBTransaction.READ_ONLY),
					objectStore = tx.objectStore('tasks'),
					cursor,
					i = 0;
			
				/* If the user is searching, we use an index, otherwise just use the object store */
				if(query.length > 0) {
					var index = objectStore.index('desc'),
						upperQuery = query.toUpperCase(),
						keyRange = IDBKeyRange.bound(upperQuery, upperQuery+'z');
				
					cursor = index.openCursor(keyRange);
				} else {
					cursor = objectStore.openCursor();
				}
		
				/* This callback function is executed for each item returned by the cursor */
				cursor.onsuccess = function(e) {
					var result = e.target.result;
					if(result == null) return;
					i++;
					/* Call the showTask function to display the task item */
					showTask(result.value, taskList);
					/* Continue to the next item in the cursor */
					result['continue']();
				}
		
				/* When the read transaction is complete, check if there are zero rows and create an empty item if so */
				tx.oncomplete = function(e) {
					if(i == 0) {
						createEmptyItem(taskList);
					}
				}
			} else if(webSQLSupport) {
				/* The one advantage WebSQL has over IndexedDB is that it supports fulltext searching */
				db.transaction(function(tx) {
					var sql, args = [];
					/* If searching, we will pass the search term and a wildcard as an argument */
					if(query.length > 0) {
						sql = 'SELECT * FROM tasks WHERE desc LIKE ?';
						args[0] = query+'%';
					} else {
						sql = 'SELECT * FROM tasks';
					}
			
					/* This callback function will be iterate over the SQL result set and display the tasks */
					var iterateRows = function(tx, results) {
						var i = 0,
							len = results.rows.length;
						for(;i<len;i++) {
							showTask(results.rows.item(i), taskList);
						}
						if(len === 0) {
							createEmptyItem(taskList);
						}
					}
			
					tx.executeSql(sql, args, iterateRows);
				});
			}
		}
		
		/* Search for a task by the entered search query */
		var searchTasks = function(e) {
			e.preventDefault();
			var query = document.forms.search.query.value;
			if(query.length > 0) {
				loadTasks(query);
			} else {
				loadTasks();
			}
		}
		
		/* Listen to the submit event of the search form */
		document.forms.search.addEventListener('submit', searchTasks, false);
		
		/* After a task has been inserted, reload tasks, display a message and return to the Task List view */
		var insertTaskSuccess = function() {
			loadTasks();
			alert('Task added successfully', 'Task added');
			document.forms.add.desc.value = '';
			document.forms.add.due_date.value = '';
			location.hash = '#list';
		}

		/* Insert a new task into the database */
		var insertTask = function(e) {
			e.preventDefault();
			var desc = document.forms.add.desc.value,
				dueDate = document.forms.add.due_date.value;
			/* Validate that a task description and due date have been entered */
			if(desc.length > 0 && dueDate.length > 0) {
				/* Build a task object to save */
				var task = {
					id: new Date().getTime(),
					desc: desc,
					descUpper: desc.toUpperCase(),
					due: dueDate,
					complete: false
				}
		
				if(indexedDB) {
					var tx = db.transaction(['tasks'], IDBTransaction.READ_WRITE);
					var objectStore = tx.objectStore('tasks');
					/* The add method inserts a new record into the object store */
					var request = objectStore.add(task);
					request.onsuccess = insertTaskSuccess;
				} else if(webSQLSupport) {
					db.transaction(function(tx) {
						var sql = 'INSERT INTO tasks(desc, due, complete) '+
									'VALUES(?, ?, ?)',
							args = [task.desc, task.due, task.complete];
						tx.executeSql(sql, args, insertTaskSuccess);
					});
				}
			} else {
				alert('Please fill out all fields', 'Add task error');
			}
		}

		/* Listen to the submit event of the Add Task form */
		document.forms.add.addEventListener('submit', insertTask, false);
		
		/* Update a task (mark as complete/incomplete) */
		var updateTask = function(task) {
			if(indexedDB) {
				/* Open an IndexedDB read/write transaction */
				var tx = db.transaction(['tasks'], IDBTransaction.READ_WRITE);
				var objectStore = tx.objectStore('tasks');
				/* The put method will update an existing item if it exists */
				var request = objectStore.put(task);
			} else if(webSQLSupport) {
				/* If a task is complete, use 1, otherwise use 0 */
				var complete = (task.complete) ? 1 : 0;
				db.transaction(function(tx) {
					/* WebSQL uses bind variables to protect against SQL injection */
					var sql = 'UPDATE tasks SET complete = ? WHERE id = ?',
						args = [complete, task.id];
					tx.executeSql(sql, args);
				});
			}
		}	

		/* Delete a task from the database */
		var deleteTask = function(id) {
			if(indexedDB) {
				var tx = db.transaction(['tasks'], IDBTransaction.READ_WRITE);
				var objectStore = tx.objectStore('tasks');
				/* delete is a reserved word in JavaScript, so use alternate syntax to be safe */
				/* To delete an item we pass the key as the argument */
				var request = objectStore['delete'](id);
				request.onsuccess = loadTasks;
			} else if(webSQLSupport) {
				db.transaction(function(tx) {
					var sql = 'DELETE FROM tasks WHERE id = ?',
						args = [id];
					tx.executeSql(sql, args, loadTasks);
				});
			}
		}
		
		/* Drop the database and reload page/data */
		var dropDatabase = function() {			
			if(indexedDB) {
				/* Drop the IndexedDB database entirely */
				indexedDB.deleteDatabase('tasks');
				window.location.reload();
			} else if(webSQLSupport) {
				db.transaction(function(tx) {
					/* Truncate the tasks table in WebSQL */
					var sql = 'DELETE FROM tasks';
					tx.executeSql(sql, [], loadTasks);
				});
			}
		}
		
		/* Check if application cache manifest has been updated */
		if('applicationCache' in window) {
			var appCache = window.applicationCache;
			appCache.addEventListener('updateready', function() {
				appCache.swapCache();
				if(confirm('Application update is available. Do you wish to update now?')) {
					window.location.reload();
				}
			}, false);
		}
	}
	
	/* When the page loads, create a new instance of the Tasks object */
	window.addEventListener('load', function() {
		new Tasks();
	}, false);
})();