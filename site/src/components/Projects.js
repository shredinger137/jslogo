var globalUpdateCode;

export default class Projects {


    constructor(updateCode) {
        globalUpdateCode = updateCode;
    }

    
    saveAs(){
        var filename = "filename.txt";
		var textToSave = document.getElementById('procs').value;
        var newFile = new Blob([textToSave], {type: 'plain/text'});
        var a = document.createElement("a"),
                url = URL.createObjectURL(newFile);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 

    }

    loadFile() {
        const input = document.getElementById('load');
        const file = input.files[0];
        var fileReader = new FileReader()
        console.log(global);

        fileReader.onload = function(fileLoadedEvent, context){
            var textFromFileLoaded = fileLoadedEvent.target.result;
            globalUpdateCode(textFromFileLoaded);
            //document.getElementById("procs").value = textFromFileLoaded;
        };
        fileReader.readAsText(file, "UTF-8");

    }



}