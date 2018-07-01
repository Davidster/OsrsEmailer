let currentSiteData;
let $itemList, $subscriberList, $saveButton;

$( document ).ready(function() {
    $itemList = $("#itemList");
    $subscriberList = $("#subscriberList");
    $saveButton = $("#saveButton");
    $addItemButton = $("#addItem");
    $addEmailButton = $("#addEmail");
    $inputItemName = $("#inputItemName");
    $inputSellPrice = $("#inputSellPrice");
    $inputEmail = $("#inputEmail");

    $inputItemName.keyup(() => {
        $addItemButton.prop("disabled", (!$inputItemName.val() || !$inputSellPrice.val()));
    });
    $inputSellPrice.keyup(() => {
        $addItemButton.prop("disabled", (!$inputItemName.val() || !$inputSellPrice.val()));
    });
    $inputEmail.keyup(() => {
        $addEmailButton.prop("disabled", !$inputEmail.val());
    });

    $addItemButton.click(() => {
        addItem($inputItemName.val(), $inputSellPrice.val());
    });
    $addEmailButton.click(() => {
        addEmail($inputEmail.val());
    });
    $saveButton.click(() => {
        updateServer(currentSiteData);
    });

    syncUI();
});

let removeItemClickHandler = (event) => {
    let $clickedRow = $(event.currentTarget).parent().parent();
    let clickedItemName = $clickedRow.find(".itemName").text();
    let itemIndex = -1;
    currentSiteData.items.forEach((item, i) => {
        if(clickedItemName === item.name) {
            itemIndex = i;
        }
    });
    currentSiteData.items.splice(itemIndex, 1);
    $clickedRow.addClass("isRemoved");
    $saveButton.prop("disabled", false);
};

let removeSubClickHandler = (event) => {
    let $clickedRow = $(event.currentTarget).parent().parent();
    let clickedEmailName = $clickedRow.find(".emailLabel").text();
    let emailIndex = -1;
    currentSiteData.subscribers.forEach((sub, i) => {
        if(clickedEmailName === sub.email) {
            emailIndex = i;
        }
    });
    currentSiteData.subscribers.splice(emailIndex, 1);
    $clickedRow.addClass("isRemoved");
    $saveButton.prop("disabled", false);
};

let testEmailClickHandler = (event) => {
    let email = $(event.currentTarget).parent().text().trim();
    if(confirm(`Send test email to ${email}?`)){
        console.log("Should send email");
        sendTestEmail(JSON.stringify({
            email: email
        }), (response) => {
            if(response === "success") {
                alert("Successfully sent test email");
            } else {
                alert("Error sending test email");
            }
        });
    }
};

let addItem = (name, sellPrice) => {
    for(let i = 0; i < currentSiteData.items.length; i++){
        if(currentSiteData.items[i].name === name){
            return alert("Item name already exists in list");
        }
    }
    let newItem = {
        name: name,
        sellPrice: sellPrice
    };
    currentSiteData.items.unshift(newItem);
    $itemList.prepend(itemRow(newItem, true));
    $saveButton.prop("disabled", false);
    refreshClickEvents();
};

let addEmail = (email) => {
    for(let i = 0; i < currentSiteData.subscribers.length; i++){
        if(currentSiteData.subscribers[i].email === email){
            return alert("Email already exists in list");
        }
    }
    let newSub = {
        email: email
    };
    currentSiteData.subscribers.unshift(newSub);
    $subscriberList.prepend(subscriberRow(newSub, true));
    $saveButton.prop("disabled", false);
    refreshClickEvents();
};

let updateServer = (data) => {
    putCsvData(JSON.stringify(data), (response) => {
        if(response === "success") {
            $saveButton.prop("disabled", true);
            syncUI();
            alert("Successfully saved data");
        } else {
            alert("Error updating server");
        }
    });
};

let syncUI = () => {
    getCsvData((data) => {
        currentSiteData = data;
        $itemList.empty();
        $subscriberList.empty();
        data.items.forEach(item=>$itemList.append(itemRow(item)));
        data.subscribers.forEach(sub=>$subscriberList.append(subscriberRow(sub)));
        refreshClickEvents();
    });
};

let refreshClickEvents = () => {
    let $testEmailButtons = $(".emailContainer button");
    let $removeItemButtons = $(".item .removeItem button");
    let $removeSubButtons = $(".subscriber .removeItem button");

    $testEmailButtons.off();
    $testEmailButtons.click(testEmailClickHandler);
    $removeItemButtons.off();
    $removeItemButtons.click(removeItemClickHandler);
    $removeSubButtons.off();
    $removeSubButtons.click(removeSubClickHandler);
};

let doRequest = (path, method, data, cb) => {
    let http = new XMLHttpRequest();
    http.open(method, path, true);
    http.setRequestHeader("Content-type", "application/json");
    http.onreadystatechange = function() { //Call a function when the state changes.
        if(http.readyState === 4) {
            let response = http.responseText;
            try{
                response = JSON.parse(response);
                console.log(response);
            } catch(e) {
                console.log("Could not parse AJAX response");
            }
            cb && cb(response, http.status);
        }
    };
    http.send(data);
};

let doGetRequest = (resourcePath, cb) => doRequest(resourcePath, "GET", undefined, cb);
let doPostRequest = (resourcePath, data, cb) => doRequest(resourcePath, "POST", data, cb);

let getCsvData = (cb) => doGetRequest("api/getCsvData", cb);
let putCsvData = (data, cb) => doPostRequest("api/putCsvData", data, cb);
let sendTestEmail = (data, cb) => doPostRequest("api/sendTestEmail", data, cb);

// HTML TEMPLATES

let itemRow = (item, isNew) => `
    <div class="form-group row rowContainer item ${isNew ? "isNew" : ""}">
        <div class="col-sm-2"></div>
        <div class="col-sm-4 itemInfoContainer">
            ${item.iconUrl ? `<img class="itemImage" src="${item.iconUrl}"/>` : ""}
            <div class="col-form-label itemName">${item.name}</div>
        </div>
        <div class="col-sm-4 itemSellPriceContainer"><div class="col-form-label itemSellPrice">Sell at: ${item.sellPrice}</div></div>
        <div class="col-sm-2 removeItem"><button class="btn btn-danger btn-sm circularButton" type="button"><i class="fas fa-minus-circle"></i></button></div>
    </div>
`;

let subscriberRow = (subscriber, isNew) => `
    <div class="form-group row rowContainer subscriber ${isNew ? "isNew" : ""}">
        <div class="col-sm-2"></div>
        <div class="col-sm-8 emailContainer">
            <div class="col-form-label emailLabel">${subscriber.email}</div>
            <button class="btn btn-secondary btn-sm" type="button"><i class="fas fa-flask"></i></button>
        </div>
        <div class="col-sm-2 removeItem"><button class="btn btn-danger btn-sm circularButton" type="button"><i class="fas fa-minus-circle"></i></button></div>
    </div>
`;