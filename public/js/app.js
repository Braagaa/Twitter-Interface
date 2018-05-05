{
    const formTweet = document.querySelector('.app--tweet form');
    const textareaTweet = document.getElementById('tweet-textarea');
    const tweetChar = document.getElementById('tweet-char');
    const tweetButton = document.querySelector('.app--tweet .button-primary');
    const tweetsList = document.querySelector('.app--tweet--list');
    
    const respJSON = res => res.json();
    const style = elm => (prop, value) => elm.style[prop] = value;
    const insertAdjacentHTML = (elm, position) => text => elm.insertAdjacentHTML(position, text);
    const {parseTweet} = twttr.txt;
    
    const replySVG = `
        <svg viewBox="0 0 38 28" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" xml:space="preserve">
           <path d="M24.9,10.5h-8.2V2.8c0-1.1-0.7-2.2-1.7-2.6c-1-0.4-2.2-0.2-3,0.6L0.8,12c-1.1,1.1-1.1,2.9,0,4L12,27.2c0.5,0.5,1.2,0.8,2,0.8c0.4,0,0.7-0.1,1.1-0.2c1-0.4,1.7-1.5,1.7-2.6v-7.7h8.2c3.3,0,6,2.5,6,5.6v1.3c0,2,1.6,3.5,3.5,3.5s3.5-1.6,3.5-3.5v-1.3C38,16.2,32.1,10.5,24.9,10.5z"></path>
        </svg>`;

    const retweetSVG = `
        <svg id="Layer_1" viewBox="0 0 50 28" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" xml:space="preserve">
            <path d="M25.2,22.4H13.1v-9.3h4.7c1.1,0,2.2-0.7,2.6-1.7c0.4-1,0.2-2.3-0.6-3.1l-7.5-7.5c-1.1-1.1-2.9-1.1-4,0L0.8,8.3c-0.8,0.8-1,2-0.6,3.1c0.4,1,1.5,1.7,2.6,1.7h4.7v12.1c0,1.5,1.3,2.8,2.8,2.8h14.9c1.5,0,2.8-1.3,2.8-2.8C28,23.7,26.7,22.4,25.2,22.4z"></path>
            <path d="M49.8,16.7c-0.4-1-1.5-1.7-2.6-1.7h-4.7V2.8c0-1.5-1.3-2.8-2.8-2.8H24.8C23.3,0,22,1.3,22,2.8s1.3,2.8,2.8,2.8h12.1v9.3h-4.7c-1.1,0-2.2,0.7-2.6,1.7c-0.4,1-0.2,2.3,0.6,3.1l7.5,7.5c0.5,0.5,1.3,0.8,2,0.8c0.7,0,1.4-0.3,2-0.8l7.5-7.5C50,18.9,50.2,17.7,49.8,16.7z"></path>
        </svg>`;

    const likeSVG = `
        <svg viewBox="0 0 35 28" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" xml:space="preserve">
            <path class="st0" d="M25.8,0c-3.6,0-6.8,2.1-8.3,5.1C16,2.1,12.9,0,9.2,0C4.1,0,0,4.1,0,9.2C0,21.4,17.3,28,17.3,28S35,21.3,35,9.2C35,4.1,30.9,0,25.8,0L25.8,0z"></path>
        </svg>`;

    const SVG = (className, name, svg) => num => `
        <a class="${className}">
            <span class="tooltip">${name}</span>
            ${svg}
            ${typeof num === 'number' ? `<strong>${num}</strong>` : ''}
        </a>`;

    const tweetItemHTML = (tweet) => {
        const {created_at, text, user, retweet_count, favorite_count} = tweet;
        const {name, screen_name, profile_image_url_https} = user;
        const getReplySVG = SVG('app--reply', 'Reply', replySVG);
        const getRetweetSVG = SVG('app--retweet', 'Retweet', retweetSVG);
        const getLikeSVG = SVG('app--like', 'Like', likeSVG);
        return `
            <li>
                <strong class="app--tweet--timestamp">${created_at}</strong>
                <a class="app--tweet--author">
                    <div class="app--avatar" style="background-image: url(${profile_image_url_https})"></div>
                    <h4>${name}</h4>
                     ${screen_name}
                </a>
                <p>${text}</p>
                <ul class="app--tweet--actions circle--list--inline">
                    <li>${getReplySVG(null)}</li>
                    <li>${getRetweetSVG(retweet_count)}</li>
                    <li>${getLikeSVG(favorite_count)}</li>
                </ul>
            </li>`;
    }

    const buttonActivity = (opacity, disabled) => button => {
        const styleButton = style(button);
        styleButton('opacity', opacity);
        button.disabled = disabled;
    }
    const buttonDisabled = buttonActivity('0.3', true);
    const buttonEnabled = buttonActivity('1', false);

    const postActivity = (str, count) => (textareaElm, countElm) => {
        textareaElm.value = str;
        countElm.textContent = count;
    }

    const maxLength = twttr.txt.configs.defaults.maxWeightedTweetLength;
    const postReset = postActivity('', maxLength);

    tweetChar.textContent = maxLength;

    formTweet.addEventListener('submit', e => {
        e.preventDefault();
        buttonDisabled(tweetButton);
  
        fetch('/post-tweet', {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({status: textareaTweet.value})
        })
        .then(respJSON)
        .then(tweetItemHTML)
        .then(insertAdjacentHTML(tweetsList, 'afterbegin'))
        .catch(err => console.log(err.message))
        .finally(buttonEnabled.bind(null, tweetButton))
        .finally(postReset.bind(null, textareaTweet, tweetChar))
    });

    textareaTweet.addEventListener('keyup', e => {
        const length = parseTweet(textareaTweet.value.trim()).weightedLength;
        const newLength = tweetChar.textContent = maxLength - length;
        const styleTweetChar = style(tweetChar);
        
        if (newLength >= 0) {
            styleTweetChar('backgroundColor', '');
            buttonEnabled(tweetButton);
        } else {
            styleTweetChar('backgroundColor', 'coral');
            buttonDisabled(tweetButton);
        }
    });
}
