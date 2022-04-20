let x = `<div class="col-sm-4 singleStatwrapper" onclick="route('services')">
        {{icon}}
        <h4>{{name}}</h4>
        <p>{{description}}</p>
        </div>`;
let statsStore = '';
let path = {};
let old_path = {};
let base_path = '';
let config;
let version = 1;

$(document).ready(()=>{
    $.getJSON(`/config.json?v=${version}`, function(response) {
        config = response;
        loadelements().then(startRennovet);
    });
    /* $.get('/rennovet/home-content.html',((content)=>{
        $('home').html(content);
        $.getJSON('/rennovet/stats.json',((stats)=>{
            statsStore = stats;
            stats.forEach((stat, index)=>{
                $(".beforeafterexample").append(x.replaceAll('{{icon}}', stat.icon).replaceAll('{{name}}', stat.name).replaceAll('{{description}}', stat.description))
            })
        }))
    })) */
    setInterval(() => {
        checkUrl();
    }, 50);
})

function startRennovet(){
    $.getJSON('/stats.json',((stats)=>{
        statsStore = stats;
        template_engine(x, stats, ".beforeafterexample").then(()=>{
            console.log('Loaded stats');
        })
    }))
}
function loadelements() {
    return new Promise((resolve, reject) => {
        var promises = [];
        components = [];
        var keys = Object.keys(config.components);
        $.each(keys, function(index, component) {
            promises.push($.get(`${config.html_path}${component}.html?v=${version}`, function(response) {
                components[index] = response;
            }));
        });
        $.when.apply($, promises).done(() => {
            $.each(components, function(index) {
                $("loader p").text(config.components[keys[index]][1]);
                $(`${config.components[keys[index]][0]} ${keys[index]}`).append(components[index]);
            });
            resolve();
        });
    });
}

function checkUrl(){
    let x = window.location.href.toLowerCase();
    if (x == path.href) {
        return false;
    }
    parseURL().then(() => {

    })
}

function route(x, y) {
    /* Object.keys(path.params).forEach((key)=>{
        if(!(window.location.pathname.toLowerCase().includes(key))){
            delete path.params[key];
        }
    }) */
    if (x.length && !y) {
        x = x.replace('&undefined', '');
        if (window.location.href.split(window.location.origin)[1].slice(1).replace('pwa/', '') !== x) {
            /* config.ispwa ? history.pushState(null, null, `/pwa/` + x) : history.pushState(null, null, `/` + x); */
            history.pushState(null, null, base_path +`/` + x);
        }
    } else if (y) {
        var temp = window.location.href.split(window.location.origin)[1].slice(1);
        if (x.length) {
            if (temp.split('?')[1]) {
                temp = x + '?' + temp.split('?')[1];
            } else {
                temp = x;
            }
        }
        if (typeof y == "object") {
            y = [y];
        }
        y.forEach((a, index) => {
                    if (Object.keys(path.params).includes(Object.keys(a)[0])) {
                        route(`${temp.split(`${Object.keys(a)[0]}=`)[0]}${Object.keys(a)[0]}=${Object.values(a)[0]}&${temp.split(`${Object.keys(a)[0]}=`)[1].split('&')[1]}`);
            } else {
                route(`${temp}${temp.includes('?') ? '&':'?'}${Object.keys(a)[0]}=${Object.values(a)[0]}`);
            }
        })
    }
}

function parseURL() {
    return new Promise((resolve, reject) => {
        if(path){
            Object.assign(old_path,path);
        }
        path.params = {};
        path.parts = {};
        $.each(window.location.search.toLowerCase().slice(1).split('&'), function(index) {
            if (this.includes('=') && this.split('=')[0] && this.split('=')[1]) {
                path.params[this.split('=')[0]] = this.split('=')[1];
            }
        })
        $.each(window.location.pathname.toLowerCase().slice(base_path.length+1).split('/'), function(index) {
            path.parts[`path_part_${index}`] = this.toString();
            $('body').attr(`path_part_${index}`, this.toString());
        })
        $.each($('body')[0].attributes, function(index) {
            if (this.specified && this.name.indexOf('path_part_') == 0) {
                path.parts[this.name] ? $('body').attr(this.name, path.parts[this.name]) : $('body').removeAttr(this.name);
            }
        })
        $('body').attr('curr_page', JSON.stringify(window.location.pathname.toLowerCase().slice(base_path.length+1).split('/')));
        path.pathname = window.location.pathname.toLowerCase().slice(1);
        path.href = window.location.href.toLowerCase();
        path.parts = Object.values(path.parts);
        //gtag_update     //DO NOT REMOVE
        resolve();
    })
}

let template_engine = function(identifier, replacements, callback) {
    return new Promise((resolve,reject)=>{
        let divTag = '';
        if(!Array.isArray(replacements)){
            replacements = [replacements];
        }
        $.each(replacements,function (index,replacement) {
            let template;
            if(/<([A-Za-z][A-Za-z0-9]*)\b[^>]*>(.*?)<\/\1>/.test(identifier)){
                template = identifier;
            }else {
                template = $(`templates ${identifier}`).parent().html()?.toString();
            }

            if(!template){
                reject('Check Identifier');
            }
            for (const property in replacement) {
                template = template.replace(new RegExp('{{' + property + '}}', 'g'), replacement[property]);
            }
            if(template.includes('{{index}}')){
                template = template.replace(new RegExp('{{index}}', 'g'), index);
            }
            divTag += template;
        })
        callback ? /function\(|[\)\*\{\}]/.test(callback.toString()) ? callback(divTag) : $(callback).length ? $(callback).append(divTag) : console.log("html element doesn't exist") : console.log("Parameter missing");
        resolve(divTag);
    })
}