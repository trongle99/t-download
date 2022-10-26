var imgLinks = [];
function isValidURL(string) {
    var res = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    return (res !== null)
};

function createNotify(status, text) {
    new Notify({
        status: status,
        title: 'Warning',
        text: text,
        autoclose: true,
        autotimeout: 2000,
        position: 'right top'
    })
};

function handle() {
    const urlString = document.getElementById('url');

    const isURL = isValidURL(urlString.value);
    if (!isURL) {
        createNotify('warning', 'Địa chỉ không hợp lệ');
        return false;
    }

    const url = new URL(urlString.value)
    if (url.hostname != 'kienkaka.pro') {
        createNotify('warning', 'Chỉ dùng địa chỉ từ website Kienkaka');
        return false;
    }
    const htmlString = httpGet(url.href);
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    const scripts = doc.querySelector('body').getElementsByTagName("script")[0];
    let arr = scripts.innerHTML.split('jQuery');
    let arr1 = arr[0].split('=');
    let obj = arr1[1].replace('[', '').replace(',]', '')
    var reg = /{([\s\S]*?)},/
    const strCopy = obj.split(reg);
    let list = document.getElementById('image-list');
    list.innerHTML = '';
    imgLinks = [];
    strCopy.forEach(item => {
        if (item != "") {
            if (item.split(',')[1] != undefined) {
                var a = item.split(',')[1]
                var src = a.split(': ')[1].replaceAll('"', '')
                imgLinks.push(src);

                var img = document.createElement('img');
                img.className = "img-fluid"
                img.setAttribute('src', src);

                var a = document.createElement('a');
                a.setAttribute('href', src);
                a.setAttribute('target', "_blank");
                a.appendChild(img)

                var div = document.createElement('div');
                div.className = "col-lg-3 col-md-4 col-6 col-sm pb-3";
                div.appendChild(a)

                list.appendChild(div)
            }
        }
    }
    );
}

function httpGet(theUrl) {
    var xmlHttp = null;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false);
    xmlHttp.send(null);
    return xmlHttp.responseText;
}

const create_zip = () => {
    if (imgLinks.length <= 0) {
        createNotify('warning', 'Chưa có hình ảnh')
        return false;
    }
    const zip = new JSZip();
    let count = 0;
    imgLinks.forEach((photo, index) => {
        JSZipUtils.getBinaryContent(photo, function (err, data) {
            zip.file("picture" + count + ".jpg", data, { binary: true });
            count++;
            if (count === imgLinks.length) {
                zip.generateAsync({ type: "blob" }).then(function (content) {
                    saveAs(content, "save-photo.zip");
                });
            }
        });
    });
};