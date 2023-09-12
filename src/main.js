const baseURI = `https://api.iera.ai`;
const assistantQnAAPI = `${baseURI}/api/v1/assistant/qna/`;
const assistantChatFeedbackAPI = `${baseURI}/api/v1/assistant_chat/update/feedback_status/`;
const assistantChatInitAPI = `${baseURI}/api/v1/assistant/init_chat/`;

async function assistantQnAAPICall(apiKey, user_message, user_id) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        question: user_message,
        user_id: user_id,
      }),
    };

    fetch(assistantQnAAPI, requestOptions).then((response) =>
      resolve(response.json())
    );
  });
}

async function assistantChatInitAPICall(apiKey) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: apiKey }),
    };

    fetch(assistantChatInitAPI, requestOptions).then((response) =>
      resolve(response.json())
    );
  });
}

async function assistantChatFeedbackAPICall(apiKey, chat_token, is_helpful) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_token: chat_token,
        is_helpful: is_helpful,
      }),
    };

    fetch(assistantChatFeedbackAPI, requestOptions).then((response) =>
      resolve(response.json())
    );
  });
}

function getIeraAPIs() {
  return {
    assistantQnAAPICall: assistantQnAAPICall,
    assistantChatFeedbackAPICall: assistantChatFeedbackAPICall,
    assistantChatInitAPICall: assistantChatInitAPICall,
  };
}

var ieraApis = getIeraAPIs();
var innovaticsChatContainer = {};
var apiKey = "";
var assistantToken = "";
var theme = "white";

function get_user_id() {
  var iera_user_id = getCookie("iera_user_id");
  if (iera_user_id == null) {
    let uid = Date.now().toString(32) + Math.random().toString(16);
    setCookie("iera_user_id", uid);
    return uid;
  } else {
    return iera_user_id;
  }
}

function setCookie(name, value) {
  var expires = "";
  var days = 365;
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
  function escape(s) {
    return s.replace(/([.*+?\^$(){}|\[\]\/\\])/g, "\\$1");
  }
  var match = document.cookie.match(
    RegExp("(?:^|;\\s*)" + escape(name) + "=([^;]*)")
  );
  return match ? match[1] : null;
}

function getLoader() {
  return `<div id="loading" class="ms-prose-invert ms-relative ms-flex  ms-min-h-[40px] ms-w-full ms-flex-col   ms-justify-center   ms-bg-opacity-10 ms-pl-2 ms-pr-2 ms-pb-2  sm:ms-pl-4 sm:ms-pr-4 sm:ms-pb-4 ms-text-gray-900  ms-border-gray-500       ms-border-opacity-50  ms-text-white sm:ms-text-base" placeholder="Output will appear here">
        <div style="display: flex;" data-testid="three-dots-loading" aria-label="three-dots-loading" aria-busy="true" role="status">
            <svg width="40" height="40" viewBox="0 0 120 30" xmlns="http://www.w3.org/2000/svg" fill="#4fa94d" data-testid="three-dots-svg">
                <circle cx="15" cy="15" r="15">
                    <animate attributeName="r" from="15" to="15" begin="0s" dur="0.8s" values="15;9;15" calcMode="linear" repeatCount="indefinite"></animate>
                    <animate attributeName="fill-opacity" from="1" to="1" begin="0s" dur="0.8s" values="1;.5;1" calcMode="linear" repeatCount="indefinite"></animate>
                </circle>
                <circle cx="60" cy="15" r="9" attributeName="fill-opacity" from="1" to="0.3">
                    <animate attributeName="r" from="9" to="9" begin="0s" dur="0.8s" values="9;15;9" calcMode="linear" repeatCount="indefinite"></animate>
                    <animate attributeName="fill-opacity" from="0.5" to="0.5" begin="0s" dur="0.8s" values=".5;1;.5" calcMode="linear" repeatCount="indefinite"></animate>
                </circle>
                <circle cx="105" cy="15" r="15"><animate attributeName="r" from="15" to="15" begin="0s" dur="0.8s" values="15;9;15" calcMode="linear" repeatCount="indefinite"></animate>
                    <animate attributeName="fill-opacity" from="1" to="1" begin="0s" dur="0.8s" values="1;.5;1" calcMode="linear" repeatCount="indefinite"></animate>
                </circle>
            </svg>
        </div>
    </div>`;
}

async function getAnswer(user_message = null) {
  if (user_message === null) {
    user_message = document.getElementById("chat-input").value;
    document.getElementById("chat-input").value = "";
  }
  document.getElementById("suggested-question-div").style["display"] = "none";

  if (user_message == "") {
    return;
  } else {
    let user_message_div = getUserMessageDiv(user_message);
    var chat_panel = document.getElementById("chat-panel-inner");
    chat_panel.innerHTML += user_message_div;
  }
  chat_panel.innerHTML += getLoader();
  var chat_panel_obj = document.getElementById("chat-panel-inner");
  chat_panel_obj.scrollTop = chat_panel_obj.scrollHeight;
  let data = await ieraApis.assistantQnAAPICall(
    apiKey,
    user_message,
    get_user_id()
  );
  if (data.success == true) {
    let message = data.message;
    let sourceList = [];
    if (data.data.sources.length > 0) {
      for (let splitedSource of data.data.sources) {
        sourceList.push(splitedSource);
      }
    }
    let bot_message = "";
    try {
      bot_message = getBotMessageWithSourcesDiv(
        marked.parse(message),
        data.data.chat_token,
        sourceList
      );
    } catch {
      bot_message = getBotMessageWithSourcesDiv(
        message,
        data.data.chat_token,
        sourceList
      );
    }

    var chat_panel = document.getElementById("chat-panel-inner");
    chat_panel.innerHTML += bot_message;
    const element = document.getElementById("loading");
    element.remove();
    var chat_panel_obj = document.getElementById("chat-panel-inner");
    chat_panel_obj.scrollTop = chat_panel_obj.scrollHeight;
  } else {
    alert(data.message);
  }
}

async function sendUserFeedback(chat_token, is_helpful) {
  await assistantChatFeedbackAPICall(apiKey, chat_token, is_helpful);
  document
    .getElementById(`${chat_token}_${is_helpful == -1 ? "No" : "Yes"}`)
    .remove();
  document
    .getElementById(`${chat_token}_${is_helpful != -1 ? "No" : "Yes"}`)
    .remove();
  const para = document.createElement("p");
  para.innerText = is_helpful == -1 ? "No" : "Yes";
  para.style["color"] = "rgb(26, 26, 26)";
  document.getElementById(`${chat_token}_helpful_button`).appendChild(para);
}

function getBotMessageWithSourcesDiv(message, chat_token, sources) {
  return `<div class="ms-bg-transparent ms-flex ms-flex-col ms-items-center ms-justify-center">
                <div class="ms-mt-4 ms-flex ms-min-h-[40px] ms-w-full ms-flex-row ms-items-start ms-justify-start ms-border-b ms-border-gray-500 ms-border-opacity-20">
                    ${getBotIconDiv()}
                    ${getBotMessageWithHelpfulDiv(message, chat_token)}
                </div>
                ${getBotMessageSourcesContent(sources)}
            </div>`;
}

function getSuggestedQuestionsDiv(suggested_questions) {
  let questions = suggested_questions;
  ques_tags = [];
  for (let question of questions) {
    ques_tags.push(
      `<div onClick="getAnswer('${question}')" class="ms-p-2 ms-mr-2 ms-mb-2  ms-whitespace-nowrap ms-rounded-lg ms-animate-fade-in-up ms-text-xs sm:ms-text-sm ms-text-gray-800 ms-bg-black ms-bg-opacity-5 hover:ms-bg-opacity-10 hover:ms-cursor-pointer ">${question}</div>`
    );
  }

  return `<div id="suggested-question-div" class=" ms-z-[100] ms-flex ms-w-full ms-items-center ms-justify-center sm:ms-mt-4">
        <div class=" ms-relative ms-flex ms-w-full ms-flex-col ms-items-start ms-justify-start ">
            <div class="ms-w-full ms-text-base ms-mt-2 sm:ms-mt-0 sm:ms-text-base">
                <div class="ms-qs-sug ms-mb-0 ms-mt-2 sm:ms-mt-0 ms-flex ms-flex-wrap ms-items-center ms-justify-start ms-w-full  ms-overflow-auto ms-text-overflow-ellipsis">
                    ${ques_tags.join(" ")}
                </div>
            </div>
        </div>
    </div>`;
}

function getInputDiv() {
  return `<div class=" ms-z-[100] ms-flex ms-w-full ms-items-center ms-justify-center sm:ms-mt-4">
                <div class=" ms-relative ms-flex ms-w-full ms-flex-col ms-items-start ms-justify-start ">
                    <div class="ms-w-full ms-text-base ms-mt-2 sm:ms-mt-0 sm:ms-text-base">
                        <div class=" ms-m-0 ms-p-0 ms-flex ms-flex-row ms-gap-2 ms-items-center ms-justify-between   ms-text-gray-400 ms-bg-gray-50  ms-transition-all ms-shadow hover:ms-shadow-md ms-p-2 ms-pl-4 ms-pr-2 ms-w-full ms-h-fit ms-outline-none ms-ring-0 ms-rounded-xl">
                            <div class="ms-w-full ms-flex ms-gap-1 ms-items-center ms-min-w-0">
                                <textarea id='chat-input' maxlength="1300" spellcheck="false" placeholder="Ask me anything." class="ms-font-sans ms-relative ms-resize-none ms-text-base sm:ms-text-base ms-flex-grow ms-bg-transparent ms-text-black ms-h-fit ms-max-h-[200px] ms-w-full focus:ms-ring-0 focus:ms-ring-transparent focus:ms-outline-none ms-ring-0 ms-ring-transparent ms-outline-none  ms-white-space-pre-wrap ms-word-wrap-break-word" id="userInput" name="userInput" style="height: 28px;"></textarea>
                            </div>
                            <button id="question-submit-btn" onclick="getAnswer()" class=" ms-z-10 ms-text-sm sm:ms-text-base ms-m-0 ms-p-0 ms-gap-1 ms-items-center ms-rounded-lg  ms-flex hover:ms-cursor-pointer ms-py-[1px] ms-px-[7px] ms-transition-all chat-card-button">
                                <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                    <path fill="none" d="M0 0h24v24H0V0z"></path>
                                    <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"></path>
                                </svg>
                                <div>Ask</div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
}

function getPoweredByDiv() {
  return `<div class="ms-flex ms-flex-row ms-items-center ms-justify-between ms-gap-1">
                <p class="ms-mt-2 ms-mb-0 ms-p-0 ms-text-xs  ms-text-[10px]  sm:ms-text-xs " style="color: rgb(0, 0, 0);">Powered by <a href="https://iera.ai" class="ms-underline" style="text-decoration-color: rgb(1, 8, 16); color: rgb(1, 8, 16);" target="_blank">iera.ai</a>
                </p>
                <div class="ms-mt-2 ms-mb-0 ms-p-0 ms-text-xs  ms-text-[10px]   ms-outline-none sm:ms-text-xs " style="color: rgb(0, 0, 0);"></div>
            </div>`;
}

async function getChatWidgetDiv(
  resetButton,
  botMessage,
  userMessage,
  suggestedQuestions
) {
  return `
        <div class="ms-z-[100] ms-h-[50%] ms-w-[95%] ms-w-full ms-transform ms-overflow-auto ms-rounded-2xl ms-text-left ms-align-middle ms-shadow-xl ms-transition-all sm:ms-max-w-[800px] sm:ms-overflow-hidden ms-opacity-100 ms-scale-100" id="headlessui-dialog-panel-6" data-headlessui-state="open">
        <div class="ms-flex  ms-max-h-full ms-w-full ms-flex-col ms-rounded-xl ms-p-2 sm:ms-p-0" style="background: rgb(255, 255, 255);">
        <div class="ms-flex ms-flex-col ms-w-full  ms-rounded-md  ms-border-opacity-20 ms-text-base ms-overflow-auto " style="color: rgb(0, 0, 0);">
            <div>
            <div></div>
            <div tabindex="-1" class="ms-w-full  ms-rounded-lg ms-flex ms-flex-col ms-gap-2 ms-p-2 ms-relative ms-bg-gray-50  ">
                <div class="ms-mx-2 ms-overflow-auto ms-relative ms-h-fit ">
                <div class="ms-flex ms-flex-row ms-w-full ms-items-center ms-justify-between">
                    <div class="ms-flex ms-flex-col ms-w-full ms-items-end  ms-gap-1" style="text-decoration-color: rgb(1, 8, 16);">
                        <div id="conversation-div" class="main-module_ms-main-bot__QKkRf ms-relative ms-w-full" style="max-height:500px;">
                            <div class="main-module_ms-main-bot__QKkRf ms-z-[100] ">
                            <!-- button reset goes here -->
                            ${resetButton}
                            <div id="chat-panel" class="main-module_ms-main-bot__QKkRf ms-z-[100]   ms-max-h-[550px] ms-w-full ms-overflow-y-auto  ms-rounded-t-md" style="color: rgb(26, 26, 26);">
                                <div id="chat-panel-inner">
                                    ${botMessage}
                                </div>
                            </div>
                        </div>
                        <div id="question-field-div" class="main-module_ms-main-bot__QKkRf ms-relative ms-w-full">
                            ${getSuggestedQuestionsDiv(suggestedQuestions)}
                            ${getInputDiv()}
                            ${getPoweredByDiv()}
                        </div>

                    </div>
                </div>
                </div>
            </div>
            </div>
        </div>
        </div>
    </div>
    `;
}

// function getBotIconDiv() {
//     return `<div class="ms-hidden ms-h-8 ms-w-8 ms-min-w-[32px] ms-flex-col ms-items-center ms-justify-center ms-rounded-lg ms-border ms-border-gray-500  ms-border-opacity-20  sm:ms-flex sm:ms-h-8 sm:ms-w-8  sm:ms-min-w-[32px]" style="background: linear-gradient(to right, rgb(1, 8, 16), rgba(1, 8, 16, 0.467)) padding-box;">
//                 <div class="messageIconContainer ms-m-0 ms-flex ms-items-center ms-justify-center ms-p-0 ms-text-sm sm:ms-text-base">
//                     <svg class="" stroke="#fff" fill="none" stroke-width="1.5" viewBox="0 0 24 24" aria-hidden="true" height="20px" width="20px" xmlns="http://www.w3.org/2000/svg">
//                         <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"></path>
//                     </svg>
//                 </div>
//             </div>`;
// }

function getBotIconDiv() {
  return `<div class="ms-hidden ms-h-8 ms-w-8 ms-min-w-[32px] ms-flex-col ms-items-center ms-justify-center ms-rounded-lg ms-border ms-border-gray-500  ms-border-opacity-20  sm:ms-flex sm:ms-h-8 sm:ms-w-8  sm:ms-min-w-[32px]" style="border: 0;">
                <div class="messageIconContainer ms-m-0 ms-flex ms-items-center ms-justify-center ms-p-0 ms-text-sm sm:ms-text-base">
                    <img src="https://app.iera.ai/assets/img/iera-chat-logo.png">
                </div>
            </div>`;
}

function getBotMessageWithHelpfulDiv(message, chat_token) {
  return `<div class="ms-prose-invert ms-relative ms-flex  ms-min-h-[40px]   ms-w-full ms-flex-col   ms-justify-center   ms-bg-opacity-10 ms-pl-2 ms-pr-2 ms-pb-2  sm:ms-pl-4 sm:ms-pr-4 sm:ms-pb-4 ms-text-gray-900  ms-border-gray-500       ms-border-opacity-50  ms-text-white sm:ms-text-base" placeholder="Output will appear here">
                <div class="ms-flex ms-w-full ms-flex-row ms-items-center ms-justify-between sm:ms-hidden">
                    <p class="ms-flex ms-text-xs sm:ms-hidden" style="color: rgb(1, 8, 16);">Assistant</p>
                </div>
                <div class=" ms-prose ms-float-left  ms-text-sm sm:ms-text-base prose-headings:ms-text-gray-900 prose-p:ms-text-gray-900 prose-a:ms-text-gray-900 prose-blockquote:ms-text-gray-900 prose-strong:ms-text-gray-900 prose-code:ms-text-gray-100 prose-li:ms-text-gray-900 ms-text-opacity-100">
                    <p>${message}</p>
                </div>
                <div>
                    <div class="ms-mt-6  ms-flex ms-items-center ms-justify-start">
                        <p class="ms-flex ms-items-center ms-text-sm  ms-text-gray-900">Was this response helpful?</p>
                    </div>
                    <div class="ms-mt-2 ms-flex ms-flex-row ms-items-center ms-justify-start sm:ms-mt-0">
                        <div id="${chat_token}_helpful_button" class="ms-mt-0 ms-flex ms-flex-row ms-space-x-2 ms-opacity-100 sm:ms-mt-2">
                            <button id="${chat_token}_Yes" onclick="sendUserFeedback('${chat_token}', 1)" class="ms-m-0 ms-p-0 ms-text-white hover:ms-bg-white hover:ms-border-gray-100 ms-rounded-md ms-border ms-border-gray-500 ms-border-opacity-20 ms-py-1 ms-px-2 ms-text-xs ms-font-medium ms-transition-all hover:ms-cursor-pointer hover:ms-bg-opacity-10 sm:ms-text-sm ms-bg-transparent" style="background-color: rgb(26, 26, 26);">
                                <span aria-label="thumbs up" class="ms-text-white">Yes</span>
                            </button>
                            <button id="${chat_token}_No" onclick="sendUserFeedback('${chat_token}', -1)" class="ms-m-0 ms-p-0 ms-text-white hover:ms-bg-white hover:ms-border-gray-100 ms-rounded-md ms-border ms-border-gray-500 ms-border-opacity-20 ms-py-1 ms-px-2 ms-text-xs ms-font-medium ms-transition-all hover:ms-cursor-pointer hover:ms-bg-opacity-10 sm:ms-text-sm ms-bg-transparent" style="background-color: rgb(26, 26, 26);">
                                <span aria-label="thumbs down" class="ms-text-white">No</span>
                            </button>
                        </div>
                    </div>
                    
                </div>
            </div>`;
}

function isValidHttpUrl(string) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

function getBotMessageSourcesContent(sources) {
  let sourceTag = `<div class="ms-flex ms-items-center ms-justify-start w-full">
                        <span class="ms-truncate ms-text-gray-900">{source}</span>
                    </div>
                    <span aria-hidden="true" class="ms-absolute ms-inset-x-0 ms-bottom-0 ms-h-0.5 ms-bg-transparent">
                    </span><br/>`;

  if (sources.length > 0) {
    let sourceStringify = ``;
    for (let source of sources) {
      if (isValidHttpUrl(source)) {
        url = `<a href="${source}" target="_blank">${source}</a>`;
        sourceStringify += sourceTag.replace(`{source}`, url);
      } else {
        sourceStringify += sourceTag.replace(`{source}`, source);
      }
    }
    return `<div class="ms-mt-4 ms-flex  ms-min-h-[40px] ms-w-full ms-flex-row ms-items-start ms-justify-start ms-border-b ms-border-gray-500 ms-border-opacity-20">
                    <div class=""></div>
                    <div class="ms-flex ms-w-full ms-flex-col  ms-overflow-auto  ms-rounded-md ms-border-opacity-20 ms-text-base" style="color: rgb(255, 255, 255);">
                        <div>
                            <div class="ms-block">
                                <p class="ms-my-2 ms-flex ms-items-center ms-text-sm  ms-text-gray-900">Verified Sources: </p>
                                <nav class="ms-flex ms-flex-col sm:ms-flex-row sm:ms-flex-wrap ms-w-full sm:ms-w-fit ms-items-start ms-justify-start  ms-overflow-auto  ms-rounded-lg  ms-text-center">
                                    ${sourceStringify}
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>`;
  }

  return ``;
}

function getBotMessageDiv(message) {
  return `
        <div class="ms-bg-transparent ms-flex  ms-flex-col ms-items-center ms-justify-center">
            <div class="ms-mt-4 ms-flex  ms-min-h-[40px] ms-w-full ms-flex-row ms-items-start ms-justify-start ms-border-b ms-border-gray-500 ms-border-opacity-20">
                ${getBotIconDiv()}
                <div class="ms-prose-invert ms-relative ms-flex  ms-min-h-[40px]   ms-w-full ms-flex-col   ms-justify-center   ms-bg-opacity-10 ms-pl-2 ms-pr-2 ms-pb-2  sm:ms-pl-4 sm:ms-pr-4 sm:ms-pb-4 ms-text-gray-900  ms-border-gray-500       ms-border-opacity-50  ms-text-white sm:ms-text-base" placeholder="Output will appear here">
                    <div class="ms-flex ms-w-full ms-flex-row ms-items-center ms-justify-between sm:ms-hidden">
                        <p class="ms-flex ms-text-xs sm:ms-hidden" style="color: rgb(1, 8, 16);">Assistant</p>
                    </div>
                    <div class=" ms-prose ms-float-left  ms-text-sm sm:ms-text-base prose-headings:ms-text-gray-900 prose-p:ms-text-gray-900 prose-a:ms-text-gray-900 prose-blockquote:ms-text-gray-900 prose-strong:ms-text-gray-900 prose-code:ms-text-gray-100 prose-li:ms-text-gray-900 ms-text-opacity-100">
                    <p>${message}</p>
                    </div>
                    <div></div>
                </div>
            </div>
        </div>
    `;
}

function getUserMessageDiv(message) {
  if (message) {
    return `
            <div class="ms-bg-transparent ms-flex  ms-flex-col ms-items-center ms-justify-center">
                <div class="ms-mt-4 ms-flex  ms-min-h-[40px] ms-w-full ms-flex-row ms-items-start ms-justify-start ms-border-b ms-border-gray-500 ms-border-opacity-20">
                    <div class="ms-hidden ms-h-8 ms-w-8 ms-min-w-[32px] ms-flex-col ms-items-center ms-justify-center ms-rounded-lg ms-border ms-border-gray-500  ms-border-opacity-20  sm:ms-flex sm:ms-h-8 sm:ms-w-8  sm:ms-min-w-[32px]" style="background-clip: padding-box;">
                        <div class="messageIconContainer ms-m-0 ms-flex ms-items-center ms-justify-center ms-p-0 ms-text-sm sm:ms-text-base">
                            <svg stroke="#000" fill="currentColor" stroke-width="0" viewBox="0 0 16 16" height="20px" width="20px" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z"></path>
                            </svg>
                        </div>
                    </div>
                    <div class="ms-prose-invert ms-relative ms-flex  ms-min-h-[40px]   ms-w-full ms-flex-col   ms-justify-center   ms-bg-opacity-10 ms-pl-2 ms-pr-2 ms-pb-2  sm:ms-pl-4 sm:ms-pr-4 sm:ms-pb-4 ms-text-gray-900  ms-border-gray-500       ms-border-opacity-50  ms-text-white sm:ms-text-base" placeholder="Output will appear here">
                        <div class="ms-flex ms-w-full ms-flex-row ms-items-center ms-justify-between sm:ms-hidden">
                            <p class="ms-flex ms-text-xs sm:ms-hidden" style="color: rgb(1, 8, 16);">You</p>
                        </div>
                        <div class=" ms-prose ms-float-right  ms-text-sm sm:ms-text-base prose-headings:ms-text-gray-900 prose-p:ms-text-gray-900 prose-a:ms-text-gray-900 prose-blockquote:ms-text-gray-900 prose-strong:ms-text-gray-900 prose-code:ms-text-gray-100 prose-li:ms-text-gray-900 ms-text-opacity-100">
                            <p>${message}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
  }
  return ``;
}

function resetChatbotWidget(initial_message) {
  let botConversation = {
    message: initial_message,
  };
  document.getElementById("suggested-question-div").style["display"] = "block";
  document.getElementById("chat-input").value = "";
  let botMessage = getBotMessageDiv(botConversation.message);
  document.getElementById("chat-panel-inner").innerHTML = botMessage;
}

innovaticsChatContainer.initialize = async function (e) {
  if (!e || !e.api_key) {
    console.error(
      "Invalid initialization options. Please provide all required parameters."
    );
    return;
  }
  apiKey = e.api_key;
  var t = document.getElementById("innovatics-chat-container"),
    a = document.createElement("button");
  a.classList.add("chat-button");
  var i = document.createElement("img");
  i.setAttribute("src", e.imageURL), a.appendChild(i), t.appendChild(a);
  var n = document.createElement("div");
  n.classList.add("innovatics-blocker"), document.body.appendChild(n);
  var c = document.createElement("div");
  c.classList.add("innovatics-chat-popup-container"),
    document.body.appendChild(c);
  data = await ieraApis.assistantChatInitAPICall(apiKey);
  let initial_message = "Hi, how can I help you?";
  let suggested_questions = [];
  if (data.data !== undefined) {
    initial_message = data.data["initial_message"];
    suggested_questions = data.data["suggested_questions"].split(",");
  }

  let resetButton = `
        <button id="ms-reset-button" onclick="resetChatbotWidget('${initial_message}')" class="ms-absolute !ms-z-[10001] ms-right-3 ms-top-2 ms-px-2 ms-py-1 ms-flex ms-items-center ms-self-end  ms-whitespace-nowrap ms-rounded-lg  ms-text-xs sm:ms-text-sm ms-bg-opacity-100 ms-opacity-100 ms-text-gray-800 ms-bg-[#ECEDEE]  hover:ms-bg-opacity-75 hover:ms-cursor-pointer ">
            <svg class="ms-mr-2" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 489.533 489.533" width="12px" style="fill: rgb(26, 26, 26); opacity: 0.8;">
                <g>
                <path d="M268.175,488.161c98.2-11,176.9-89.5,188.1-187.7c14.7-128.4-85.1-237.7-210.2-239.1v-57.6c0-3.2-4-4.9-6.7-2.9l-118.6,87.1c-2,1.5-2,4.4,0,5.9l118.6,87.1c2.7,2,6.7,0.2,6.7-2.9v-57.5c87.9,1.4,158.3,76.2,152.3,165.6c-5.1,76.9-67.8,139.3-144.7,144.2c-81.5,5.2-150.8-53-163.2-130c-2.3-14.3-14.8-24.7-29.2-24.7c-17.9,0-31.9,15.9-29.1,33.6C49.575,418.961,150.875,501.261,268.175,488.161z"></path>
                </g>
            </svg>
            <p>Reset</p>
        </button>
    `;

  let promptTemplate = `<div class="ms-qs-sug ms-mb-0 ms-mt-2 sm:ms-mt-0 ms-flex ms-flex-wrap ms-items-center ms-justify-start ms-w-full  ms-overflow-auto ms-text-overflow-ellipsis"><div class="ms-p-2 ms-mr-2 ms-mb-2  ms-whitespace-nowrap ms-rounded-lg ms-animate-fade-in-up ms-text-xs sm:ms-text-sm ms-text-gray-800 ms-bg-black ms-bg-opacity-5 hover:ms-bg-opacity-10 hover:ms-cursor-pointer ">How to cache llm calls?</div><div class="ms-p-2 ms-mr-2 ms-mb-2  ms-whitespace-nowrap ms-rounded-lg ms-animate-fade-in-up ms-text-xs sm:ms-text-sm ms-text-gray-800 ms-bg-black ms-bg-opacity-5 hover:ms-bg-opacity-10 hover:ms-cursor-pointer ">What is a prompt template?</div></div>`;
  let botConversation = {
    message: initial_message,
  };
  let botMessage = getBotMessageDiv(botConversation.message);
  let userMessage = getUserMessageDiv();
  var o = await getChatWidgetDiv(
    resetButton,
    botMessage,
    userMessage,
    suggested_questions
  );

  (document.querySelector(".innovatics-chat-popup-container").innerHTML = o),
    // Execute a function when the user presses a key on the keyboard
    document
      .getElementById("chat-input")
      .addEventListener("keypress", function (event) {
        // If the user presses the "Enter" key on the keyboard
        if (event.key === "Enter") {
          // Cancel the default action, if needed
          event.preventDefault();
          // Trigger the button element with a click
          document.getElementById("question-submit-btn").click();
        }
      }),
    a.addEventListener("click", function (e) {
      e.stopPropagation(),
        (document.querySelector(".innovatics-blocker").style.display = "block"),
        (document.querySelector(
          ".innovatics-chat-popup-container"
        ).style.display = "block");
    }),
    document
      .querySelectorAll(".close-chat-popup-container, .innovatics-blocker")
      .forEach(function (e) {
        e.addEventListener("click", function () {
          (document.querySelector(".innovatics-blocker").style.display =
            "none"),
            (document.querySelector(
              ".innovatics-chat-popup-container"
            ).style.display = "none");
        });
      });
};
