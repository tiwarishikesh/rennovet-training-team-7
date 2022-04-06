let x = `<div class="col-sm-4 singleStatwrapper">
        {{icon}}
        <h4>{{name}}</h4>
        <p>{{description}}</p>
        </div>`;
let statsStore = '';

$(document).ready(()=>{
    $.getJSON('/rennovet/stats.json',((stats)=>{
        statsStore = stats;
        stats.forEach((stat, index)=>{
            $(".beforeafterexample").append(x.replaceAll('{{icon}}', stat.icon).replaceAll('{{name}}', stat.name).replaceAll('{{description}}', stat.description))
        })
    }))
})

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