import { clearMap, setNewMapData } from './state';
import { decodeMap } from './save';
import { template } from './template';
import steg from './vendors/steganography';
import LZString from 'lz-string';

function clickElem(elem) {
  // Thx user1601638 on Stack Overflow (6/6/2018 - https://stackoverflow.com/questions/13405129/javascript-create-and-save-file )
  const eventMouse = document.createEvent('MouseEvents');
  eventMouse.initMouseEvent(
    'click',
    true,
    false,
    window,
    0,
    0,
    0,
    0,
    0,
    false,
    false,
    false,
    false,
    0,
    null,
  );
  elem.dispatchEvent(eventMouse);
}

export function loadTemplate() {
  clearMap();
  setNewMapData(decodeMap(template));
}

export function tryLoadAutosaveMap() {
  document.cookie = '';
  if (localStorage) {
    const autosave = localStorage.getItem('autosave');
    if (autosave !== null) {
      clearMap();
      setNewMapData(decodeMap(JSON.parse(autosave)));
      return true;
    }
  }
  return false;
}

export function loadMapFromFile() {
  const readFile = function (eventRead) {
    const file = eventRead.target.files[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = function (event) {
      const dataURL = event.target!.result as string;

      const image = new Image();
      image.src = dataURL;
      image.addEventListener(
        'load',
        () => {
          const mapJSONString = steg.decode(dataURL, {
            height: image.height,
            width: image.width,
          });
          clearMap();

          let json;
          try {
            json = JSON.parse(mapJSONString);
          } catch (err) {
            console.log(LZString.decompress(mapJSONString))
            json = JSON.parse(LZString.decompress(mapJSONString));
          }
          const map = decodeMap(json);

          setNewMapData(map);
        },
        false,
      );
    };
    reader.readAsDataURL(file);
  };
  loadFile(readFile);
}

export function loadFile(onLoad) {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.style.display = 'none';
  fileInput.onchange = onLoad;
  clickElem(fileInput);
}
