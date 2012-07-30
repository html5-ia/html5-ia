// JavaScript Code for Registration Form

window.onload = function() {
	document.register.revenue.oninput = function() {
		var revenue = parseInt(document.register.revenue.value, 10);
		if(revenue < 1000) document.register.revenue_display.value = "$"+revenue+" m";
		else document.register.revenue_display.value = "$"+(revenue/1000)+" bn";
	}
	
	document.getElementById("password").oninput = function() {
		var password = document.register.password.value, strength = 0, len = password.length;
		if(len > 0) strength = 1;
		if(len > 3) strength = 2;
		if(len > 5) strength = 3;
		if(len > 5 && /\d/.test(password)) strength = 4;
		if(len > 7 && /\d/.test(password)) strength = 5;
		document.getElementById("password_strength").value = strength;
	}
	
	document.register.onsubmit = function() {
		if(document.register.checkValidity()) alert("Valid!");
		else alert("Invalid!");
	}
}