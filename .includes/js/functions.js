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
	var settings = {
		output : 'canvas',
		bgColor : '#FFFFFF',
		color : '#000000',
		barWidth : 2,
		barHeight : 50,
		posX : 0,
		posY : 0,
		fontSize : 12,
		showHRI : 1
	};
	$("#canvasBarcode").show().barcode(value, "code39", settings);

	var canvas = document.getElementById("canvasBarcode");
	return canvas.toDataURL("image/png");
}

function createSingleLabel(row){
	var labelData = [];
	
	var mainContact;	
	if (row[14] !== "") { mainContact =row[14]; }
	else if (row[15] !== "") { mainContact = row[15]; }
	
	labelData.push({
		swabID: row[1], 
		testName: row[2], 
		dogName: row[5], 
        petName: row[6], 
        TattooOrChip: row[8],
        ownerName: row[13],
        contact: mainContact
	});
	createAllLabels(labelData);
}

//function createAllLabels(swabs, testList, dogName, petName, TattooOrChip, ownerName, contact) {
function createAllLabels(labelData) {
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

	for (var i = 0; i < labelData.length; i++) {
		ddLabels.content.push(pdfLabel(labelData[i]));
		if (i < labelData.length - 1)
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

function pdfLabel(label) {
	
	//swabID, testName, dogName, petName, TattooOrChip, ownerName, contact
	barcodeData = generateBarcode(label.swabID);
	dogName = label.dogName.toUpperCase();
	
	if (dogName === '') {
		dogName = label.petName;
	} else {
		dogName += ' (' + label.petName + ')';
	}
	if (label.TattooOrChip !== '') {
		dogName += "\n" + label.TattooOrChip;
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
				margin : [20,5,0,0]
			} ] ]
		},
		layout : 'noBorders'
	}, {
		table : {
			body : [ [ {
				text : 'Test',
				style : 'strong'
			}, {
				text : label.testName.toUpperCase()
			} ], [ {
				text : 'Dog',
				style : 'strong'
			}, {
				text : dogName
			} ], [ {
				text : 'Contact',
				style : 'strong'
			}, {
				text : label.ownerName.toUpperCase() + "\n" + label.contact
			} ] ]
		},
		layout : 'noBorders'
	} ];
}
