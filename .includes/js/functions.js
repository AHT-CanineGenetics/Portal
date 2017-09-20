function addVetDetails() {
	var vetDetails;
	try {
		vetDetails = JSON.parse(localStorage.getItem('vetDetails')) || [];
	} catch (err) {
		vetDetails = [];
	}

	if ($('#vet-name').val()) {
		var vet = {
			"id" : vetDetails.length + 1,
			"name" : $('#vet-name').val(),
			"phone" : $('#vet-phone').val(),
			"fax" : $('#vet-fax').val(),
			"email" : $('#vet-email').val(),
			"address" : $('#vet-address').val(),
			"city" : $('#vet-city').val(),
			"postcode" : $('#vet-postcode').val(),
		};
		$('#vet-select').append($('<option>', {
			value : vet.id,
			text : vet.name
		}));
		vetDetails.push(vet);

		$('#vet-name').val("");
		$('#vet-phone').val("");
		$('#vet-fax').val("");
		$('#vet-email').val("");
		$('#vet-address').val("");
		$('#vet-city').val("");
		$('#vet-postcode').val("");
	}

	if ($('#vet-select option').size() > 1) {
		$('#vet-select option:last').prop('selected', true);
	}
	localStorage.setItem('vetDetails', JSON.stringify(vetDetails));
}

function showVetModal() {
	$('#vetModal').modal('show');
	if ($('#vet-select option').size() > 1) {
		$('#vet-select option:last').prop('selected', true);
	}

	$('#vetModal').on('hide.bs.modal', function(e) {
		if ($('#vet-select option').size() == 1) {
			$('#vet-verified').prop('checked', false).change();
			$('#vet-select-div').hide();
		}
	});
}

function clearCanvas() {
	var canvas = $('#canvasBarcode').get(0);
	var ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function generateBarcode(value) {
	clearCanvas();
	/*
	 * var settings = { output: 'canvas', bgColor: '#FFFFFF', color: '#000000',
	 * barWidth: 1, barHeight: 70, posX: 0, posY: 0, showHRI: 0 };
	 */
	var settings = {
		output : 'canvas',
		bgColor : '#FFFFFF',
		color : '#000000',
		barWidth : 2,
		barHeight : 40,
		posX : 0,
		posY : 0,
		fontSize : 16,
		showHRI : 1
	};
	$("#canvasBarcode").show().barcode(value, "code39", settings);

	var canvas = document.getElementById("canvasBarcode");
	return canvas.toDataURL("image/png");
}

/*function createAllLabels(swabs, testList, petName, ownerName, mainContact) {
	var doc = new jsPDF({
		orientation : 'landscape',
		unit : 'mm',
		format : [ 100, 62 ]
	});

	for (var i = 0; i < testList.length; i++) {
		console.log(swabs[i]);
		createLabel(doc, swabs[i], testList[i], petName, ownerName, mainContact);
		if (i < testList.length - 1)
			doc.addPage();
	}

	// doc.autoPrint();
	doc.output('dataurlnewwindow');
}

function createLabel(doc, swabID, testCode, dogName, ownerName, contact) {
	barcodeData = generateBarcode(swabID);

	doc.setFont("helvetica");
	doc.setFontSize(18);
	doc.setFontType("bold");
	// doc.text(23, 12, 'Swab #'+swabID);
	doc.text(25, 12, swabID);

	doc.setFontSize(18);
	doc.setFontType("bold");
	doc.text(3, 30, 'Test:');
	doc.setFontSize(16);
	doc.setFontType("normal");
	doc.text(25, 30, testCode);

	doc.setFontSize(18);
	doc.setFontType("bold");
	doc.text(3, 40, 'Dog:');
	doc.setFontSize(16);
	doc.setFontType("normal");
	doc.text(25, 40, dogName.toUpperCase());

	doc.setFontSize(18);
	doc.setFontType("bold");
	doc.text(3, 50, 'Contact:');
	doc.setFontSize(16);
	doc.setFontType("normal");
	doc.text(35, 50, ownerName.toUpperCase());
	doc.text(10, 58, contact);

	doc.addImage(aht, 'PNG', 1, 1, 20, 18);
	// doc.addImage(DATA, 'PNG', x, y, w, h);
	// doc.addImage(barcodeData, 'PNG', 60, 1, 40, 40);
	doc.addImage(barcodeData, 'PNG', 60, 1, 64, 32);
}*/

function createAllLabels(swabs, testList, dogName, petName, TattooOrChip, ownerName, contact) {
	pdfMake.fonts = {
		Courier : {
			normal : 'Courier.ttf',
			bold : 'Courier-Bold.ttf',
			italics : 'Courier-Italic.ttf',
			bolditalics : 'Courier-Bold-Italic.ttf'
		},
		Tahoma : {
			normal : 'Tahoma.ttf',
			bold : 'Tahoma Bold.ttf',
			italics : 'Tahoma.ttf',
			bolditalics : 'Tahoma Bold.ttf',
		}
	};
	
	var ddLabels = {
		pageSize : {
			height : 175.748,
			width : 283.465
		},
		pageMargins : [ 10, 10, 10, 10 ],
		content : [],
		defaultStyle : {
			font : 'Tahoma',
			fontSize : 10,
			margin : [ 0, 5, 0, 5 ]
		},
		styles : {
			h1 : {
				margin : [ 0, 15, 0, 0 ],
				fontSize : 16,
				bold : true
			},
			strong : {
				bold : true
			}
		},
		images : {
			ahtLogo : aht
		}
	};

	for (var i = 0; i < testList.length; i++) {
		ddLabels.content.push(pdfLabel(swabs[i], testList[i], dogName, petName, TattooOrChip, ownerName, contact));
		if (i < testList.length - 1)
			ddLabels.content.push({
				text : '',
				style : 'small',
				pageBreak : 'after'
			});
		else
			ddLabels.content.push({
				text : '',
				style : 'small'
			});
			
	}
	
	pdfMake.createPdf(ddLabels).open();
}

function pdfLabel(swabID, testName, dogName, petName, TattooOrChip, ownerName, contact) {
	
	barcodeData = generateBarcode(swabID);
	dogName = dogName.toUpperCase();
	
	if (dogName === '') {
		dogName = petName;
	} else {
		dogName += ' (' + petName + ')';
	}
	if (TattooOrChip !== '') {
		dogName += "\n" + TattooOrChip;
	}

	return [ {
		table : {
			widths : [ 'auto', '*' ],
			body : [ [ {
				image : 'ahtLogo',
				fit : [ 50, 50 ]
			}, {
				image : barcodeData,
				width : 150,
				margin : [0,10,0,0]
			} ] ]
		},
		layout : 'noBorders'
	}, {
		table : {
			body : [ [ {
				text : 'Test',
				style : 'strong'
			}, {
				text : testName.toUpperCase()
			} ], [ {
				text : 'Dog',
				style : 'strong'
			}, {
				text : dogName
			} ], [ {
				text : 'Contact',
				style : 'strong'
			}, {
				text : ownerName.toUpperCase() + "\n" + contact
			} ] ]
		},
		layout : 'noBorders'
	} ];
}
