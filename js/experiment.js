var openModal = function(func) {
	var realFunc = func;
	$("#myForm")
		.off("submit")
		.on("submit", function(e){
			e.preventDefault();
			if($( "#myForm" ).valid()) {
				realFunc();
			}
		});

	dialog = $("#myForm").dialog({
		modal : true,
		buttons : {
			"Save" : function(){
				if ($( "#myForm" ).valid()) {
					func();
				}
			},
			Cancel : function(){
				dialog.dialog("close");
			}
		}
	});
};

$("#button").on('click', function() {

	//clean the leftovers from modal inputs

	$("#title").val("");
	$("#brand").val("");
	$("#sales").val("");
	$("#quarter").val("Q1");
	$("#year").val("2014");
	$("#winconf").val("Low");

	// open modal for saving data

	openModal(saveFunc);
});

var saveFunc = function() {	
	
	var data = JSON.parse(localStorage.getItem("data")) || [] ;

	var row = {
			id : (data.length ? data[data.length - 1].id + 1 : 1),
			title : $("#title").val(),
			brand : $("#brand").val(),
			usd : $("#sales").val() || 0,
			chf : parseInt($("#sales").val() * 1.1),
			quarter : $("#quarter").val(),
			year : $("#year").val(),
			launch : $("#quarter").val() + " " + $("#year").val(),
			winconf : $("#winconf").val()
		};

	saveToLocalStorage(data, row);

};

var edit = function(key) {

	var data = JSON.parse(localStorage.getItem("data"));

		// copy info to the form

		$("#title").val(data[key].title);
		$("#brand").val(data[key].brand);
		$("#sales").val(data[key].usd);
		$("#quarter").val(data[key].quarter);
		$("#year").val(data[key].year);
		$("#winconf").val(data[key].winconf);

		openModal(
			function () {
				var row = {
					id : data[key].id,
					title : $("#title").val(),
					brand : $("#brand").val(),
					usd : $("#sales").val() || 0,
					chf : parseInt($("#sales").val() * 1.1),
					quarter : $("#quarter").val(),
					year : $("#year").val(),
					launch : $("#quarter").val() + " " + $("#year").val(),
					winconf : $("#winconf").val()
				};

				saveToLocalStorage(data, row, key);
			}
		);
};

var remove = function(key) {
	var data = JSON.parse(localStorage.getItem("data"));
	data.splice(key,1);
	localStorage.setItem("data", JSON.stringify(data));
	loadData();
	loadLabels();
};

var deleteRow = function(key) {
	var realKey = key;
    $("#dialog-confirm").dialog({
        resizable: false,
        width: 400,
        modal: true,
        buttons: {
            "Delete": function() {
                remove(realKey);
                $(this).dialog("close");
            },
            Cancel: function() {
                $(this).dialog("close");
            }
        }
    });
};

var saveToLocalStorage = function(data, row, key){
		(key)? data[key]=row : (row.id == 1 && data[2])? data[key]=row : data.push(row);
		localStorage.setItem("data", JSON.stringify(data));
		dialog.dialog("close");
		loadData();
		loadLabels();
	};

function loadData() {

	var data = JSON.parse(localStorage.getItem("data")) || [];

	//clean tbody 
	$("#tbody").html("");

	data.forEach(function(row, index) {
		var template = $("#template").html();
		Mustache.parse(template);   // optional, speeds up future uses
		row.key = index;
		var rendered = Mustache.render(template, row);
		$("#tbody").append(rendered);
	});

};

var loadLabels = function() {

		var data = JSON.parse(localStorage.getItem("data")) || [];

		var marketLaunches = data.length,
			regionalSales = 0;
			globalSales = 0;

		for (var i=0; i < data.length; i++) {
				regionalSales += parseInt(data[i].usd);
				globalSales += parseInt(data[i].chf);
			};

		var labelsObject = {
			marketLaunches : marketLaunches,
			regionalSales : regionalSales,
			globalSales : globalSales
		};

		var labels = $("#labels").html();
		Mustache.parse(labels);   // optional, speeds up future uses
		var rendered = Mustache.render(labels, labelsObject);
		$("#totals").html(rendered);
	};

loadData();
loadLabels();

$("#myForm").validate({
	rules: {
    	title: {
			required: true,
			minlength: 4
		},
		sales: {
	  	required: true,
	  	number: true
		}
	}
});
