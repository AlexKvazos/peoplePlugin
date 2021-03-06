(function (angular) {
    angular
        .module('peopleEnums', [])
        .constant('CODES', {
            NOT_FOUND: 'NOTFOUND',
            SUCCESS: 'SUCCESS'
        })
        .constant('MESSAGES', {
            ERROR: {
                NOT_FOUND: "No result found",
                CALLBACK_NOT_DEFINED: "Callback is not defined",
                ID_NOT_DEFINED: "Id is not defined",
                DATA_NOT_DEFINED: "Data is not defined",
                OPTION_REQUIRES: "Requires options"
            }
        })
        .constant('EVENTS', {
            ROUTE_CHANGE: "ROUTE_CHANGE"
        })
        .constant('COLLECTIONS', {
            peopleInfo: "peopleInfo",
            people: "people"
        })
        .constant('PATHS', {
            MEDIA: "MEDIA",
            HOME: "HOME"
        });
})(window.angular, undefined);