const PAGINATION_LINK_SELECTOR = '.pagination a';
const DISABLE_PAGINATION_LINK_CLASS = 'disbale';

const FILE_HISTORY_BLOCK_SELECTOR = '#file-history';

const FILE_UPLOAD_FORM_BUTTON_SELECTOR = '#submit-form';
const FILE_UPLOAD_BUTTON_SELECTOR = '#dataFile';

const NOTIFICATION_BLOCK_SELECTOR = '#notifications-block';
const NOTIFICATION_CONTENT_SELECTOR = '#notifications-content';

const SUCCESS_NOTIFICATION_CLASS = 'success';
const SUCCESS_NOTIFICATION_MESSAGE = 'Data has been inserted/updated successfully!';

$(document).ready(function(){
    getFileHistory(0);

    $(FILE_HISTORY_BLOCK_SELECTOR).on('click', PAGINATION_LINK_SELECTOR, function(){
        const page = $(this).data('page');
        if ($(this).hasClass(DISABLE_PAGINATION_LINK_CLASS)) {
            return;
        }
        getFileHistory(page);
    });

    $(FILE_UPLOAD_FORM_BUTTON_SELECTOR).on('click', function(e) {
        e.preventDefault();

        if (!$(FILE_UPLOAD_BUTTON_SELECTOR)[0].files[0]) {
            return;
        }
        
        var formData = new FormData();
        formData.append('dataFile', $(FILE_UPLOAD_BUTTON_SELECTOR)[0].files[0]);

        const response = $.ajax({
            url: '/fileUpload',
            type: 'POST',
            data: formData,
            async: false,
            processData: false,
            contentType: false,
        });

        if (response.status === 200) {
            renderSuccessNotification();
        } else {
            renderErrorNotification(response.responseJSON);
        }

    });
});

function getFileHistory (page) {
    $.ajax({
        type: 'get',
        url: '/fileHistory',
        data: {page},
        dataType: 'text'
    })
    .done(function(data){
        $(FILE_HISTORY_BLOCK_SELECTOR).html(data);
    });
}

function renderSuccessNotification () {
    $(NOTIFICATION_BLOCK_SELECTOR).addClass(SUCCESS_NOTIFICATION_CLASS);
    renderNotificationList(SUCCESS_NOTIFICATION_MESSAGE, []);
}

function renderErrorNotification (data) {
    $(NOTIFICATION_BLOCK_SELECTOR).removeClass(SUCCESS_NOTIFICATION_CLASS);
    const errorsArr = data.error;
    renderNotificationList(errorsArr[0], errorsArr.slice(1));
}

function renderNotificationList (description, listContent) {
    const html = `
        <p>${description}</p>
        <ul>
            ${listContent.map((message) => `<li>${message}</li>`).join('')}
        </ul>
    `;

    $(NOTIFICATION_CONTENT_SELECTOR).html(html);

    $(NOTIFICATION_BLOCK_SELECTOR).show();
}