$("#file-1").fileinput({
    theme: 'fas',
    uploadUrl: '#', // you must set a valid URL here else you will get an error
    overwriteInitial: false,
    maxFileSize: 10000,
    maxFilesNum: 100,
    dropZoneEnabled: false,
    //allowedFileTypes: ['image', 'video', 'flash'],
    slugCallback: function (filename) {
        return filename.replace('(', '_').replace(']', '_');
    }
  });
  