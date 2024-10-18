const local = (data) => {
    console.log(data);

    if (!is_this_local) {
        pujs.popup(l("You are blocked"), l("You can't config the server<br>since you are not the host."), [
            {
                'text': l('Close'),
                'callback': () => {
                    location.href = '/' + location.search;
                }
            }
        ], 'vert');

        return;
    }

    fetch('/settings/.json').then(data => data.json()).then(data => {

        function keyLoop(json) {

            let config = {};

            try {
                for (let key in json.$config) {
                    config[key] = json.$config[key];
                }

                delete json.$config;
            } catch { }
            let HTML = document.createElement('div');

            HTML.classList.add('settings');

            for (let key in json) {
                let type = Array.isArray(json[key]) ? 'array' : typeof json[key];

                if (type === 'object') {

                    let title = document.createElement('span');

                    title.innerHTML = parseName(key);

                    title.classList.add('title');


                    HTML.appendChild(title);

                    title.style.display = 'none';

                    HTML.appendChild(keyLoop(json[key]));
                }

                if (type === 'boolean') {
                    let switch_element = document.createElement('div');
                    let span = document.createElement('span');
                    span.classList.add('switch');

                    if (json[key]) {
                        span.classList.add('checked');
                    }

                    switch_element.innerHTML = '<span>' + parseName(key) + '</span>';

                    switch_element.classList.add('switch-element');
                    switch_element.appendChild(span);

                    try {
                        if (config.readOnlyItems && config.readOnlyItems.includes(key)) {
                            switch_element.classList.add('disabled');
                        }
                    } catch { }

                    HTML.appendChild(switch_element);
                }

                if (type === 'string') {
                    let input_set = document.createElement('div');

                    let continueWorking = true;

                    try {
                        if (config.readOnlyItems && config.readOnlyItems.includes(key)) {

                            // Add a span instead of input

                            let key_span = document.createElement('span');
                            key_span.innerHTML = parseName(key);
                            key_span.classList.add('settings-value-placeholder');

                            input_set.appendChild(key_span);

                            let span = document.createElement('span');
                            span.innerHTML = json[key];
                            span.classList.add('input');
                            span.classList.add('settings-value');
                            span.readOnly = true;

                            input_set.appendChild(span);

                            HTML.appendChild(input_set);

                            continueWorking = false;
                        }
                    } catch { }

                    if (continueWorking) {
                        input_set.classList.add('input-set');

                        let placeholder = document.createElement('span');
                        placeholder.innerHTML = parseName(key);
                        placeholder.classList.add('placeholder');


                        let input = document.createElement('input');
                        input.classList.add('input');
                        input.type = 'text';
                        input.value = json[key];
                        input.placeholder = parseName(key);
                        input.classList.add('settings-input');



                        input_set.appendChild(input);

                        input_set.appendChild(placeholder);

                        HTML.appendChild(input_set);
                    }

                }

                if (type === 'number') {
                    let input_set = document.createElement('div');

                    try {
                        if (config.readOnlyItems && config.readOnlyItems.includes(key)) {
                            input.readOnly = true;
                        }
                    } catch { }

                    let placeholder = document.createElement('span');
                    placeholder.innerHTML = parseName(key);
                    placeholder.classList.add('placeholder');

                    input_set.appendChild(placeholder);

                    let input = document.createElement('input');
                    input.classList.add('input');
                    input.type = 'number';
                    input.placeholder = parseName(key);
                    input.value = json[key];
                    input.classList.add('settings-input');



                    input_set.appendChild(input);

                    input_set.classList.add('input-set');

                    HTML.appendChild(input_set);
                }
            }

            return HTML;
        }

        let HTML = keyLoop(data);

        let save_button = document.createElement('button');
        save_button.innerHTML = l('Save');
        save_button.classList.add('save-button');

        save_button.addEventListener('click', () => {

            let settings = {};

            function loopBack(HTML) {
                let settings = {};

                console.log(HTML);

                HTML.childNodes.forEach(child => {
                    if (child.classList.contains('input-set')) {
                        let input = child.querySelector('input');
                        if (input) {
                            let key = reverseName(input.placeholder);
                            settings[key] = input.type === 'number' ? parseFloat(input.value) : input.value;
                        }
                    } else if (child.classList.contains('switch-element')) {
                        let span = child.querySelector('.switch');
                        let keySpan = child.querySelector('span:first-child');
                        if (span && keySpan) {
                            let key = reverseName(keySpan.innerText);
                            settings[key] = span.classList.contains('checked');
                        }
                    } else if (child.classList.contains('settings')) {
                        let title = child.previousElementSibling;
                        if (title) {
                            let key = reverseName(title.innerText);
                            settings[key] = loopBack(child);
                        }
                    }
                });

                return settings;
            }

            let settingsHTML = document.querySelector('.settings-container>.settings');

            console.log(settingsHTML);

            // remove the button
            settingsHTML.removeChild(settingsHTML.querySelector('.save-button'));

            settings = loopBack(settingsHTML);

            console.log(settings);

            fetch('/writeSettings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            }).then(data => data.json()).then(data => {
                if (data.success) {
                    pujs.popup(l('Success'), l('The settings have been saved.'), [
                        {
                            'text': l('Close'),
                            'callback': () => {
                                location.href = '/settings' + location.search;
                            }
                        }
                    ], 'vert');
                } else {
                    pujs.popup(l('Error'), data.error, [
                        {
                            'text': l('Close'),
                            'callback': () => {
                                location.href = '/settings' + location.search;
                            }
                        }
                    ], 'vert');
                }
            });
        });

        HTML.appendChild(save_button);


        document.querySelector('.settings-container').appendChild(HTML);

        let backA = document.createElement('a');
        backA.href = '/' + location.search;
        backA.innerHTML = l('Back');

        let center = document.createElement('center');
        center.classList.add('back');
        center.appendChild(backA);

        document.querySelector('.settings-container').appendChild(center);


        let switches = document.getElementsByClassName('switch');
        for (let i = 0; i < switches.length; i++) {
            switches[i].addEventListener('click', function () {
                switches[i].classList.toggle('checked');
            });
        }
    });
}


function parseName(name) {
    // nameName -> Name Name
    let newName = '';
    for (let i = 0; i < name.length; i++) {
        if (name[i] === name[i].toUpperCase()) {
            newName += ' ';
        }
        newName += name[i];
    }

    newName = newName[0].toUpperCase() + newName.slice(1);

    return newName;
}

function reverseName(name) {
    return name.replace(/\s+/g, '').replace(/^\w/, c => c.toLowerCase());
}