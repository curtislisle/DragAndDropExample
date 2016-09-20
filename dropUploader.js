/* dragappUpload Application
 * 
 * This is an application that lets the user drag & drop  files
 * onto the webpage and decide which files out of the list to upload to process.
 * 
 * update revision:
 * 09/23/16 CRL condense drag & drop functionality from Cardiac processing demos 
 */

// start with an empty array that will contain a record of the CSV content of the files.  
var dragapp = {}
dragapp.fileArray = []
dragapp.fileCount = 0

// accumulation datastructures  

dragapp.reference = []


// this is automatically called when a file is dropped onto the file drop zone.   The text for the  files
// and the corresponding name are stored in the dragapp.fileArray data structure.  This lets the user minimally edit
// the list before creating an output. 

function load(file) {
var xmlfilecontent = []
if (file==null)
  xmlfilecontent = "<header> <a>sometext</a> </header>"
  else {
  var reader = new FileReader();

  reader.onload = function(e) {
        // store the resulting file in browser local storage
        var fileDict = {}
        fileDict['name'] = file.name
        fileDict['contents'] = e.target.result
        dragapp.fileArray.push(fileDict)
        dragapp.fileCount = dragapp.fileCount*1 + 1
        console.log('dragapp file count now: ',dragapp.fileCount)
        console.log(dragapp.fileArray)
        // update the display lists on the web page and the delete selector (in case it is needed)
        //initializeDatasetSelector();
        initializeListGroupSelector();
  }
  // read the files, which takes place in another thread.  Can't see the results immediately.
  reader.readAsText(file);
  }
}

// this is the callback invoked when a user drops a filename on the dropzone area.  It updates the visual
// content and calls the "load" function directly.  This is attached as a callback later in the file. 

function handleFileSelect(evt) {
        evt.stopPropagation();
        evt.preventDefault();
		//console.log(evt)
        var files = evt.dataTransfer.files; // FileList object.

        var output = [];
        for (var i = 0, f; f = files[i]; i++) {
          // load the tree that was dropped onto the drop pane and update the catalog of loaded
          // datasets in the UI
          load(f);
        }
}

// this function and its callback assignment below are needed for the drag action to work. This is
// called many times during the drag over the target, but we aren't taking any explicit action until
// a drop occurs. 
  
function handleDragOver(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

//------ trash can handling routines ---------------------------------

/* based on an example found at url below.  The tricky part was embedding the filename into the 
 * mouse event.  without the setData() call and the new function  dragStartHandler, the events came across
 * without any data associated to them.
 * 
 * http://www.w3.org/TR/2011/WD-html5-20110113/dnd.html
 */

var internalDNDType = 'text/dragapp-file'; 
function dragStartHandler(event) {
      // use the element's data-value="" attribute as the value to be moving:
      event.dataTransfer.setData(internalDNDType, event.target.dataset.value);
      event.effectAllowed = 'move'; // only allow moves
 }
  
// this is invoked when an item is dropped on the trash can icon. 

function trashHandleItemDrop(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        var data = event.dataTransfer.getData(internalDNDType);
          console.log("drop detected for:",data)  
          dropFile(data)  

}
// this function is needed to catch the drag events but not take any action.  
function trashHandleDragOver(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'move'; // Explicitly show this is a copy.
}

// this function is called when the user selects a dataset to be dropped from the candidate list.
// it is called by the drop handler of the trash can.   

function dropFile(selectedDataset) {

    for(var i = 0;i<dragapp.fileArray.length;  i++) {
      if(dragapp.fileArray[i].name == selectedDataset) {
       dragapp.fileArray.splice(i, 1);
       break;  // stop right away, there might be duplicates with matching names, but only delete one at a time
      }
    }
    // show the updated file list in the console. 
    console.log(dragapp.fileArray)
    
	// disable the preview and delete buttons if there are no files left.  This way the user can't try to 
	// preview empty records. 
	
	if (dragapp.fileArray.length==0) {
			var trashcan = d3.select('#trashcan')
			trashcan.attr("disabled", true);		
			var previewbutton = d3.select('#processbutton')
			previewbutton.attr("disabled", true);
		}
    
    // we know the operation is complete now, so query the database and update the UI
    initializeListGroupSelector();
}

//------ end trash can support ----------------------------------------


function initializeListGroupSelector() {
	
		// use the prettier Bootstrap list group instead of the old style output list
        d3.select("#currentdatasetlist").selectAll("a").remove();
        var datasetTable = []
        for (var i = 0; i < dragapp.fileArray.length ;  i++) {
           datasetTable.push(dragapp.fileArray[i]['name'])
        };
        
        //attempt to reset so second list is draggable, but it doesn't work
        //d3.select("#currentdatasetlist").attr("ondragstart","dragStartHandler(event)");	
      
	  for (var i = 0; i < datasetTable.length; ++i) {
           // create drag-and-drop elements here
           var myurl = 'file://'+datasetTable[i]
           $("#currentdatasetlist").append('<a href="'+myurl+'" class="list-group-item draggable="true"  data-value="'+datasetTable[i]+'">' + datasetTable[i] + '</a>');
      }	

		// enable the control buttons now 
		if (datasetTable.length>0) {
      var previewbutton = d3.select('#showbutton')
      previewbutton.attr("disabled", null);	
			var processbutton = d3.select('#processbutton')
			processbutton.attr("disabled", null);
		}
}


// examine which files are currently uploaded for processing.  This updates a rendering of the whole list on the 
// right side of the webpage and also enables a selection element, so an uploaded file can be deleted if it shouldn't
// be part of the processing

function displayDatasets() {

        var datasetTable = []
        for (var i = 0; i < dragapp.fileArray.length ;  i++) {
           datasetTable.push(dragapp.fileArray[i]['name'])
        };

        // display the whole current dataset above the selector to show users what datasets are currently loaded
       var output = []
       for (var i = 0; i < datasetTable.length; i++) {
          output.push('<li><strong>', escape(datasetTable[i]), '</strong> </li>');
          output.push('<text>' + dragapp.fileArray[i]['contents']  + '</text>');
 
        }
        document.getElementById('filecontent').innerHTML = '<ul>' + output.join('') + '</ul>';

		// enable the preview button now 
		if (datasetTable.length>0) {
			var previewbutton = d3.select('#processbutton')
			previewbutton.attr("disabled", null);
		}
}



function writeOutput() {
    // point to the list of dropped files
    var content = dragapp.fileArray;

    // write out arrays in CSV format
    var finalVal = 'filename,content\n';

    for (var i = 0; i < content.length; i++) {
        var value = content[i]["contents"];
        var valuename = content[i]["name"]
        console.log('name=',valuename,' content=',value)

       finalVal = finalVal += valuename + ','+ value + '\n'
    }

    // here is the trick to download a file to the users downloads default directory. 
    // We create an element.  An <a> type is the easiest.  Then we set the MIME type of the HTML element
    // Finally, set the name of the file as the download attribute and cause an event on the element.  The 
    // download happens immediately. 

    console.log(finalVal);
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(finalVal));
    pom.setAttribute('download', 'dragappOutput.csv');
    pom.click();
}





// this function is called as soon as the page is finished loading
window.onload = function () {   

        // Setup the drag and drop listeners.
        var dropZone = document.getElementById('drop_zone');
        dropZone.addEventListener('dragover', handleDragOver, false);
        dropZone.addEventListener('drop', handleFileSelect, false);
        
        // there is a trash can button for dropping unwanted studies
        var trashCan = document.getElementById('trashcan');
        trashCan.addEventListener('dragover', trashHandleDragOver, false);
        trashCan.addEventListener('drop', trashHandleItemDrop, false);

        initializeListGroupSelector();
 
        // set a watcher on the UI buttons to take action when they are clicked
		d3.select("#processbutton")
         .on("click", writeOutput);
    d3.select("#showbutton")
         .on("click", displayDatasets);
	

};
