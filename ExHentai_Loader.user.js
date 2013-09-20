// ==UserScript==
// @name           ExHentai Loader
// @description    Helping you fap faster.
// @author         Infinity
// @version        1.0
// @include        http://g.e-hentai.org/*
// @include        http://exhentai.org/*
// @grant          none
// @noframes
// ==/UserScript==

if(document.getElementById("wcr_btnsettings"))
    return;

var g = {};

function safeArray(a, i){
    try{return a[i];}
    catch(e){return "";}
}

function pause(){
    g.ready = false;
    document.body.style.cursor = "wait";
}

function resume(){
    g.ready = true;
    document.body.style.cursor = "default";
}

function html2dom(html){
    var container = (g.type == 3) ? document.createElement("div") : document.createElement("tbody");
    container.innerHTML = html.replace(/<script(.|\s)*?\/script>/gi,"").replace(/<iframe(.|\s)*?\/iframe>/gi,"");
    if(g.type == 3)
        galleryStyle(container, true);
    return container;
}

function htmlDecode(input){
    if(typeof input === "undefined")
        return undefined;
    var e = document.createElement('div');
    e.innerHTML = input;
    return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
}

function get(){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", g.currentPage.nextURL, true);
    xhr.ontimeout = function(){resume();};
    xhr.onerror = function(){resume();};
    xhr.onload = function(){
        g.currentPage = new page(xhr.responseText);
        var DOMContent = html2dom(g.currentPage.content);
        g.appendTo.appendChild(DOMContent);
        //if(g.type == 3){document.images[document.images.length-1].scrollIntoView();}           
        g.currentPage.content = "";
        if(g.auto && g.currentPage.nextURL)
            g.autoTimeout = setTimeout(function(){get();}, g.wait);
        else if(g.currentPage.nextURL)
            setTimeout(function(){resume();}, g.wait);
        else{
            resume();
            g.ready = false;
        }
    };
    xhr.send();
}

function page(html){
    this.content = 
        /*Search*/safeArray(html.match(/(<div class="itg[^]*?)<table/i),1) || safeArray(html.match(/(<tr class="gtr[^]*?)<\/table>/i),1) ||
        /*Thumbs*/safeArray(html.match(/<div id="gdt">([^]*?)<\/div><table/i),1) ||
        /*Images*/safeArray(html.match(/<a onclick="[^>]*?" href="[^>]*?">(<img id="img" src="[^>]{150,}?"[^>]*?>)/i), 0) + "<br/><br/><br/><br/><br/>";
            this.nextURL = htmlDecode(
                /*Search*/safeArray(html.match(/<a href="(http[^"]*)"[^>]*>&gt;<\/a>/i),1) || 
                /*Thumbs*/function(){var thumbURL=document.location.href.match(/^http:\/\/e(x|-)hentai\.org\/g\/.*\//i);var str=safeArray(html.match(/<td onclick="sp\(([0-9]*)\)"><a href="#" onclick="return false">&gt;<\/a>/i),1);return str?thumbURL+"?p="+str:undefined;}() ||
                /*Images*/function(){var str=safeArray(html.match(/<a onclick="([^>]*?)" href="([^>]*?)"><img id="img" src="([^>]{150,}?)"/i),2);return(str&&str!=g.currentPage.nextURL)?str:"";}()
                    );
}

function galleryStyle(target, initial){
    var imgs = target.getElementsByTagName("img");
    for(var i = 0; i < imgs.length; i++){
        if(initial){
            imgs[i].setAttribute("oldwidth", imgs[i].style.width);
            imgs[i].setAttribute("oldheight", imgs[i].style.height);
        }
        imgs[i].style.width = (parseInt(imgs[i].getAttribute("oldwidth"))*g.resize/100)+"px";
        imgs[i].style.height = (parseInt(imgs[i].getAttribute("oldheight"))*g.resize/100)+"px";
    }
}

g.appendTo =
    /*1-Search*/safeArray(document.getElementsByClassName("itg"),0) ||
    /*2-Thumbs*/document.getElementById("gdt") ||
    /*3-Images*/document.getElementById("i1");
g.type = (g.appendTo==safeArray(document.getElementsByClassName("itg"),0))?1:(g.appendTo==document.getElementById("gdt"))?2:(g.appendTo==safeArray(document.getElementsByClassName("sni"),0))?3:0; if(g.type==0){return}
g.currentPage = new page("");
g.currentPage = new page(document.body.innerHTML);
if(g.type == 3){
    g.appendTo = document.body;
    document.body.setAttribute("style", "text-align:center;");
    g.appendTo.innerHTML = g.currentPage.content;
    galleryStyle(document, true);
}
g.currentPage.content = "";
g.ready = true;
g.resize = 100;
g.auto = true;
g.wait = 2000;
get();
g.autoTimeout = setTimeout(function(){},0);
if(g.wait > 0){
    pause();
    document.body.style.cursor = "default";
    setTimeout(function(){resume();}, g.wait);
}
