//################################################
//# jQuery AutoValidate v3.0.2; 2009-FEB-27
//# 
//#  Copyright (c) 2008 Gavin Kistner (phrogz.net)
//#  Licensed under the MIT (MIT-LICENSE.txt)
//# 
//# See http://phrogz.net/tmp/FormAutoValidate/
//################################################

/************************************************************
Form Auto Validation Library
v 1.1		 20020721 -- added email, date, minLen, maxlength
v 1.2		 20020723 -- tersified as library, NS6 compat, bug fixin, date ranges
v 1.2.1	 20020730 -- non-required empty dates no longer incorrectly fail with bad format
v 1.2.2	 20020808 -- extra \ added to email regexp to really require period
v 1.3		 20030122 -- radio buttons now support required="true"
v 1.3.5	 20030201 -- added generic form-level requiredmessage
v 1.3.6	 20030228 -- integer types can now be negative
v 1.4		 20030506 -- showallerrors added
v 1.4.5	 20030529 -- skips disabled elements
v 1.4.6	 20030612 -- minor tweak on event attaching to work with Safari
v 1.4.7	 20030728 -- fix to skip 'elements' without .value (fieldset)
v 1.4.8	 20030731 -- minlength only enforced on non-required elements when a value is supplied
v 1.5		 20030801 -- regexp are now insensitive by default; added 'mustmatchcasesensitive="true"' option
v 1.6		 20031126 -- minchecked and maxchecked added
v 1.8		 20040222 -- minselected/maxselected/minchosen/maxchosen/mustnotmatch added;
										 regexp no longer wrapped in ^...$ automatically;
										 'failedvalidation' now added/removed from <label>s that go with elements.
v 1.8.1	 20040401 -- mustnotmatch actually works now (thanks, reflous)
v 1.8.2	 20080916 -- elements without IDs no longer associated with labels without "for" attributes.
										 'failedvalidation' also added/removed on the failing elements themselves.
v 2.0		 20080918 -- rewrite; validation now occurs onchange/click of each element,
										 providing instantaneous visual indication of validation (via 'failedvalidation' CSS)
										 the API remains nearly the same, however.
v 3.0    20081011 -- further rewrite to use jQuery; changed API slightly (some attributes moved to classes)
                     removed some features (required radio buttons, single-error messages)
v 3.0.2  20090227 -- Hack to keep from throwing errors for IE8.
*************************************************************/
jQuery(function($){
	var theFormCriteria		 = 'form.autovalidate';
	
	var theFieldCriteria	 = [];
	var theFieldTypes			 = 'input textarea select'.split(' ');
	var theFieldClasses		 = ['required'];
	var theFieldAttributes = 'mustmatch mustnotmatch minvalue maxvalue minlength minchosen maxchosen validateas'.split(' ');
	// TODO: re-add maxlength when jQuery bug fixed: http://dev.jquery.com/ticket/3468
	$.each( theFieldTypes, function(_,inFieldType){
		$.each( theFieldClasses, function(_,inFieldClass){
			theFieldCriteria.push( inFieldType+"."+inFieldClass );
		});
		$.each( theFieldAttributes, function(_,inFieldAttribute){
			theFieldCriteria.push( inFieldType+"["+inFieldAttribute+"]" );
		});
	});
	theFieldCriteria = theFieldCriteria.join(',');
	
	var theFailedValidationClass = 'failedvalidation';
	var theFieldClassSetter = function( inJField, inClassName, inKeepFlag ){
		var theLabel = inJField.data('label', inJField.data('label') || $(inJField[0].form).find('label[for='+inJField.attr('name')+']') );
		if ( theLabel ) inKeepFlag ? theLabel.addClass( inClassName ) : theLabel.removeClass( inClassName );
		inKeepFlag ? inJField.addClass( inClassName ) : inJField.removeClass( inClassName );
	}

	var theFieldValidator = function(inEventOrField){
		var theField = inEventOrField.target || inEventOrField;
		var theJField = $(theField);
		var theJForm	= $(theField.form);
		if ( theJField.data('blessedBox') ){
			return theWatcher( theJField.data('blessedBox') );
		}

		var required		 = theJField.hasClass('required');
		var mustMatch		 = theJField.attr("mustmatch");
		var mustNotMatch = theJField.attr("mustnotmatch");
		var minVal			 = theJField.attr("minvalue");
		var maxVal			 = theJField.attr("maxvalue");
		var minLen			 = theJField.attr("minlength");
		var maxLen			 = theJField.attr("maxlength") && theJField.attr("maxlength") >= 0 && theJField.attr("maxlength");
		var minChosen		 = theJField.attr("minchosen");
		var maxChosen		 = theJField.attr("maxchosen");
		var valAs				 = theJField.attr("validateas");
		var valMsg			 = theJField.attr("mustmatchmessage");

		// Clear validation errors on myself (and maybe related checkboxes)
		theFieldClassSetter( theJField, theFailedValidationClass, false );
		if ( theJField.data('siblingBoxes') ){
			theJField.data('siblingBoxes').each(function(_,inSiblingBox){
				theFieldClassSetter( $(inSiblingBox), theFailedValidationClass, false );
			});
		}		
		var theValidationErrorsByName = theJForm.data( 'validationErrorsByName' );
		delete theValidationErrorsByName[ theField.name ];

		var theValue = theField.value;
		var niceName = theJField.attr("nicename") || theField.name;

		if (valAs){
			switch( valAs.toLowerCase() ){
				case 'email':
					mustMatch='^[^@ ]+@[^@. ]+\\.[^@ ]+$';
					if (!valMsg) valMsg = niceName+" doesn't look like a valid email address. It must be of the format 'john@host.com'";
				break;
				case 'phone':
					mustMatch='^\\D*\\d*\\D*(\\d{3})?\\D*\\d{3}\\D*\\d{4}\\D*$';
					if (!valMsg) valMsg = niceName+" doesn't look like a valid phone number.";
				break;
				case 'zipcode':
					mustMatch='^\\d{5}(?:-\\d{4})?$';
					if (!valMsg) valMsg = niceName+" doesn't look like a valid zip code. It should be 5 digits, optionally followed by a dash and four more, e.g. 19009 or 19009-2314";
				break;
				case 'integer':
					mustMatch='^-?\\d+$';
					if (!valMsg) valMsg = niceName+" must be an integer.";
				break;
				case 'float':
					mustMatch='^-?(?:\\d+|\\d*\.\\d+)$';
					if (!valMsg) valMsg = niceName+" must be a number, such as 1024 or 3.1415 (no commas are allowed).";
				break;				
			}
		}

		var errors = [];

		// TODO: support requiring radio buttons
		if (required && !theValue){
			errors.push(
				theJField.attr('requiredmessage') ||
				(theJForm.attr('requiredmessage') && theJForm.attr('requiredmessage').replace(/%nicename%/gi,niceName)) ||
				(niceName+' is a required field.')
			);
		}

		if (mustMatch && theValue){
			mustMatch = new RegExp(mustMatch,(theJField.attr('mustmatchcasesensitive')=='true'?'':'i'));
			if (!mustMatch.test(theValue)) errors.push( valMsg || (niceName+' is not in a valid format.') );
		}

		if (mustNotMatch && theValue){
			mustNotMatch=new RegExp(mustNotMatch,(theJField.attr('mustmatchcasesensitive')=='true'?'':'i'));
			if (mustNotMatch.test(theValue)) errors.push( valMsg || (niceName+' is not in a valid format.') );
		}

		if (minVal && theValue && (theValue*1 < minVal*1)) errors.push( niceName+' may not be less than '+minVal+'.' );
		if (maxVal && theValue && (theValue*1 > maxVal*1)) errors.push( niceName+' may not be greater than '+maxVal+'.' );
		if (minLen && (theValue.length < minLen*1 ) && (required || theValue)) errors.push( niceName+' must have at least '+minLen+' characters.' );
		if (maxLen && (theValue.length > maxLen*1)) errors.push( niceName+' may not be more than '+maxLen+' characters (it is currently '+theValue.length+' characters).' );

		if (valAs=='date' && theValue){
			var curVal = new Date(theValue);
			if (isNaN(curVal)) errors.push( niceName+' must be a valid date (e.g. 12/31/2001)' );
			//TODO: format the dates nicely, e.g. #M#/#D#/#YYYY#
			if (minVal && ((new Date(minVal)) > curVal)) errors.push( niceName+' must be no earlier than '+new Date(minVal)+'.' );
			if (maxVal && ((new Date(maxVal)) < curVal)) errors.push( niceName+' must be no later than '+new Date(maxVal)+'.' );
		}

		if (minChosen || maxChosen){
			var theNumChosen;
			if ( theField.type=='checkbox' ){
				theNumChosen = theJForm.find( 'input[name='+theField.name+']:checked' ).length;
			} else if ( theField.options ){
				theNumChosen = theJField.find( 'option:selected' ).length;
			}
			if (theNumChosen<minChosen) errors.push( 'Please choose at least '+minChosen+' '+niceName );
			if (theNumChosen>maxChosen) errors.push( 'Please choose no more than '+maxChosen+' '+niceName );
		}
		
		if (errors.length){
			theValidationErrorsByName[ theField.name ] = { el:theField, message:errors.join("\n") };
			theFieldClassSetter( theJField, theFailedValidationClass, true );
			if ( theJField.data('siblingBoxes') ){
				theJField.data('siblingBoxes').each(function(_,inSiblingBox){
					theFieldClassSetter( $(inSiblingBox), theFailedValidationClass, true );
				});
			}
		}
	}
	
	var theInitializer = function(_,inForm){
		inForm = $(inForm);
		inForm.data( "validationErrorsByName", {} );

		// Walk by index instead of using .find() for speed and to track ordering
		for (var i=0,len=inForm[0].elements.length;i<len;i++){
			var theField = $(inForm[0].elements[i]);
			// TODO: remove maxlength test when jQuery bug fixed: http://dev.jquery.com/ticket/3468
			if (theField.is(theFieldCriteria) || ( theField.attr('maxlength') && theField.attr('maxlength') >= 0 ) ){
				theField.data('nativeIndex',i);
				if (theField[0].type=='checkbox'){
					var theSiblings = $(theField.form).find('input[name='+theField.name+']:checkbox').not(theField);
					theSiblings.data('blessedBox',theField[0]);
					theSiblings.add(theField).click(theFieldValidator);
					theField.data('siblingBoxes',theSiblings);
				} else {
					theField.change(theFieldValidator);
				}
				// Validate the field right off the bat.
				theFieldValidator( theField[0] );
			}
		}
		
		inForm.submit(function(inEvent){
			var theValidationErrors = [];
			$.each(inForm.data('validationErrorsByName'),function(_,inFieldErrors){
				theValidationErrors.push( inFieldErrors );
			});
			if (theValidationErrors.length){
				theValidationErrors.sort(function(e1,e2){
					e1 = e1.el.tabIndex*1000 + $(e1.el).data('nativeIndex');
					e2 = e2.el.tabIndex*1000 + $(e2.el).data('nativeIndex');
					return e1<e2?-1:e1>e2?1:0;
				});
				var theErrorList = $.map(theValidationErrors,function(inError){
					return inError.message;
				}).join("\n");
				alert(theErrorList);
				var theFirstField = theValidationErrors[0].el;
				try{ theFirstField.focus();	 } catch(e){};
				try{ theFirstField.select(); } catch(e){};
				inEvent.cancelFurtherSubmits=true;
				inEvent.preventDefault();
				inEvent.stopPropagation();
				return false;
			}
			return false
		});
	};

	$(theFormCriteria).each( theInitializer );
	$(document).bind('DOMNodeInserted',function(inEvent){
		$(inEvent.target).find(theFormCriteria).andSelf().filter(theFormCriteria).each(theInitializer);
	});
	
});
