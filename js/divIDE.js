// Setting up the main structure
NELEMENTS = 0;
var TEST;
var main = $("#main")[0];
makeMenu(main, 'main');
main.addEventListener("contextmenu", showMenu, false);
main.addEventListener("click", clearMenu, false);


// Setting up the layout panels
function makeMenu(elem, number){
    var menu = '';
    menu += '\
    <menu class="ctxMenuStyle ctxMenu" style="display:none" id="ctxMenu' + number + '"> \
    <menu title="Add Container" class="ctxMenuStyle" onclick="addContainer(this)"> \
    </menu> '
    if (number != 'main'){
        menu += '<menu title="Remove Container" class="ctxMenuStyle" onclick="removeContainer(this)"> \
        </menu>'
    }
    menu += '<menu title="Align" class="ctxMenuStyle"> \
                 <menu title="Vertical" class="ctxMenuStyle"  onclick="alignVertical(this)"> </menu>  \
                 <menu title="Horizontal" class="ctxMenuStyle" onclick="alignHorizontal(this)"></menu> \
        </menu> \
    </menu>'
    elem.innerHTML += menu;
}

function makeContainerBlock(elem) {
    elem.innerHTML += "\
        <div class='contentBlock layoutBlock'><table><tbody> \
        <tr>\
            <td>Width:</td> \
            <td><input type='number' min=0 max=2048 class='layoutWidth' value='1' onchange='boxWidthChange(this)'> \
            </input> </td> \
            <td> <select class='unit' onchange='boxWidthChange(this)'> \
                  <option value='flex'>flex</option> \
                  <option value='px'>px</option> \
                 </select> \
            </td> \
        </tr> \
        <tr>\
            <td>Height:</td> \
            <td><input type='number' min=0 max=2048 class='layoutWidth' value='1' onchange='boxHeightChange(this)'> \
            </input> </td> \
            <td> <select class='unit' onchange='boxHeightChange(this)'> \
                  <option value='flex'>flex</option> \
                  <option value='px'>px</option> \
                 </select> \
            </td> \
        </tr> \
        </tbody></table></div>"
}

function showMenu(event){
    if ($('#tmLayout').data('clicks')) {
        var number = event.target.id;
        clearMenu();
        event.stopPropagation();
        event.preventDefault();
        var ctxMenu = $("#ctxMenu" + number)[0];
        ctxMenu.style.display = "block";
        ctxMenu.style.left = (event.pageX - 10)+"px";
        ctxMenu.style.top = (event.pageY - 60)+"px";
    }
};

function clearMenu(){
    var ctxMenus = $(".ctxMenu");
    for (var i=0; i < ctxMenus.length; i++){
        ctxMenus[i].style.display = "none";
        ctxMenus[i].style.left = "";
        ctxMenus[i].style.top = "";    
    }

};

function alignVertical(melem){
    elem = melem.parentElement.parentElement.parentElement;
    elem.classList.remove("rowItems")
    elem.classList.add("columnItems")
}
function alignHorizontal(melem){
    elem = melem.parentElement.parentElement.parentElement;
    elem.classList.remove("columnItems")
    elem.classList.add("rowItems")
}

// Function for layout box
function boxSizeChange(melem, wh){
    var elem = $(melem).closest('div').parent();
    var tr = $(melem).closest('tr');
    var unit = $(tr).find('select')[0].value;
    var size = $(tr).find('input')[0].value;
    if (unit == 'flex'){
        elem.css('flex', size);
        elem.css('max-' + wh, '');
        inputs = elem.find('input');
        for (var i = 0; i < inputs.length; i++){
            var u = $(inputs[i]).closest('tr').find('select')[0].value;
            if (u == 'flex'){
                inputs[i].value = size;
            }
        }
    } else if (unit == 'px') {
        elem.css('flex', '');
        elem.css('max-'+ wh, size + unit);
    }
}

function boxWidthChange(melem){
    boxSizeChange(melem, 'width');
}
function boxHeightChange(melem){
    boxSizeChange(melem, 'height');
}

function removeContainer(elem){
    //parentElement = $(this).parent('div')
    parentElem = elem.parentElement.parentElement
    if (parentElem.id != 'main'){
        parentElem.remove();
    }
}

function addContainer(elem){
    parentElem = elem.parentElement.parentElement;
    div = document.createElement('div');
    div.className = 'container editBorderStyle rowItems';
    parentElem.appendChild(div);
    div.id = NELEMENTS + 1;
//             div.innerHTML = NELEMENTS + 1;
    NELEMENTS += 1;
    makeMenu(div, div.id);
    makeContainerBlock(div);
    div.addEventListener("contextmenu", showMenu, false);
    div.addEventListener("click", clearMenu, false);
}

function containerContents(elem){
    var contents = [];
    var children = $(elem).children('div');
    for (var i = 0; i < children.length; i++){
        var child = $(children[i]);
        contents.push({
           divType: 'container',
           classes: child.attr('class'),
           id: child.attr('id'),
           style: child.attr('style'),
           data: {
               contents: containerContents(child),
               width: child.css('max-width'),
               height: child.css('max-height'),
               flex: child.css('flex')
           }
        });
    }
    return contents;
}


// JQuery Magic
$(document).ready(function(){
    $('#tmLayout').click(function() {
      var clicks = $(this).data('clicks');
      if (clicks) {
        $('.container').addClass("borderStyle");
        $('#main').addClass("borderStyle");
        $('.container').removeClass("editBorderStyle");
        $('#main').removeClass("editBorderStyle");
        $(this).text('Edit'); 
        $('.layoutBlock').hide();
      } else {
        $('.container').removeClass("borderStyle");
        $('#main').removeClass("borderStyle");
        $('.container').addClass("editBorderStyle");
        $('#main').addClass("editBorderStyle");
        $(this).html(' &#8594; Edit');
        $('.layoutBlock').show();
      }
      $(this).data("clicks", !clicks);
    });

    $('#tmLayoutSave').click(function(){
       exportLayout(); 
    });

    $('#tmLayoutLoadFile').change(function (e) {
        var layout;
        function callback(result) {
            layout = JSON.parse(result);
            TEST = layout;  // DEBUG TODO: remove this
            console.log("Remove above debugging line.")
            importLayout(layout);
        }
        readSingleFile(e, callback);
        });
}); // end of document.ready


// Setting up the common functions, general utility
function exportLayout(){
    // Build the json structure defining the layout
    var main = $('#main');
    var layout = {
        divMain: {
            divType: 'container', //has to be a container
            classes: main.attr('class'),
            id: main.attr('id'),
            data: {
                contents: containerContents(main)
            }
        }
    }
    download('layout.json', JSON.stringify(layout));
}


function importLayout(layout){
    // TODO:
}

// Downloading a file: http://stackoverflow.com/questions/3665115/create-a-file-in-memory-for-user-to-download-not-through-server
function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

// Looks like importing is trickier: https://www.html5rocks.com/en/tutorials/file/dndfiles/
// Importing/reading a single file: http://stackoverflow.com/questions/3582671/how-to-open-a-local-disk-file-with-javascript
function readSingleFile(e, callback) {
  var file = e.target.files[0];
  if (!file) {
    return;
  }
  var reader = new FileReader();
  reader.onload = function (e) {
      callback(reader.result);
  }
  // This function is asynchronous, which means we have no idea when it will happen. 
  // As such, after it's finished, we need to have a callback to do something with the
  // results. Hence the above callback function.
  reader.readAsText(file);
}
