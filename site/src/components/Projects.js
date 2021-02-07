import Dexie from 'dexie';

var globalUpdateCode;
var localDatabase = new Dexie();

export default class Projects {


  constructor(updateCode) {
    globalUpdateCode = updateCode;
  }

  async initializeDatabase() {
    localDatabase.version(1).stores({
      projects: '++id, name, code'
    })
  }


  async writeLastCodeToLocalStorage(code) {

    //read the database and see if 'recover' exists; if so, get the id key

    this.getRecoverEntry().then(async function (entries) {
      if (entries && entries.length > 0) {

        //if a recovery entry exists, update it with the new code

        var recoveryId = entries[0]["id"];
        await localDatabase.projects.update(recoveryId, {
          name: "recover",
          code: code
        })
      } else {
        await localDatabase.projects.add({
          name: 'recover',
          code: code
        })
        //if a recover entry doesn't exist, create it

        //TODO

      }

    })

  }

  async getRecoverEntry() {
    var returnValue = false;
    if (localDatabase && localDatabase.projects) {
      returnValue = await localDatabase.projects.where('name').equals('recover').toArray();
    }
    return returnValue;

  }



  saveAs() {
    var filename = "filename.txt";
    var textToSave = document.getElementById('procs').value;
    var newFile = new Blob([textToSave], { type: 'plain/text' });
    var a = document.createElement("a"),
      url = URL.createObjectURL(newFile);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);

  }

  

  loadFile() {
    const input = document.getElementById('load');
    const file = input.files[0];
    var fileReader = new FileReader()

    fileReader.onload = function (fileLoadedEvent, context) {
      var textFromFileLoaded = fileLoadedEvent.target.result;
      globalUpdateCode(textFromFileLoaded);
      //document.getElementById("procs").value = textFromFileLoaded;
    };
    fileReader.readAsText(file, "UTF-8");

  }



}