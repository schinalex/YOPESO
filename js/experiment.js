var modalForm = $("#myForm");
var openModal = function(editOrAdd) {
	modalForm
		.off("submit")
		.on("submit", function(e){
			e.preventDefault();
			if(modalForm.valid()) {
				editOrAdd();
			}
		});

	dialog = modalForm.dialog({
		modal : true,
		buttons : {
			"Save" : function(){
				if (modalForm.valid()) {
					editOrAdd();
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

	openModal(addRow);
});

var addRow = function() {	
	
	var data = JSON.parse(localStorage.getItem("data")) || [] ;

	var row = {
			id : (data.length) ? parseInt(data[data.length - 1].id) + 1 : 1,
			title : $("#title").val(),
			brand : $("#brand").val(),
			usd : parseInt($("#sales").val() || 0),
			chf : parseInt($("#sales").val() * 1.1),
			quarter : $("#quarter").val(),
			year : $("#year").val(),
			launch : $("#year").val() + " " + $("#quarter").val(),
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
					usd : parseInt($("#sales").val() || 0),
					chf : parseInt($("#sales").val() * 1.1),
					quarter : $("#quarter").val(),
					year : $("#year").val(),
					launch : $("#year").val() + " " + $("#quarter").val(),
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

		(key>=0) ? data[key]=row : data.push(row);

		localStorage.setItem("data", JSON.stringify(data));
		dialog.dialog("close");
		loadData();
		loadLabels();
	};

var renderTable = function(data) {
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

var loadData = function(){
	var data = JSON.parse(localStorage.getItem("data")) || [];
	renderTable(data);
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

modalForm.validate({
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

var sortItems = function(tableColumn){
	var data = JSON.parse(localStorage.getItem("data"));
	var compare = function(a, b) {
				if (a[tableColumn] < b[tableColumn]) return -1;
	            if (a[tableColumn] > b[tableColumn]) return 1;
	        	return 0;
	};
	data.sort(compare);
	renderTable(data);
};