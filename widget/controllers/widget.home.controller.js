'use strict';

(function (angular, window) {
    angular
        .module('peoplePluginWidget')
        .controller('WidgetHomeCtrl', ['$scope', '$window', 'Buildfire', 'TAG_NAMES', 'ERROR_CODE', "Location", '$sce', 'PeopleInfo', function ($scope, $window, Buildfire, TAG_NAMES, ERROR_CODE, Location, $sce, PeopleInfo) {
            var MANUALLY = 'Manually',
                OLDEST_TO_NEWEST = 'Oldest to Newest',
                NEWEST_TO_OLDEST = 'Newest to Oldest',
                FIRST_NAME_A_TO_Z = 'First Name A-Z',
                FIRST_NAME_Z_TO_A = 'First Name Z-A',
                LAST_NAME_A_TO_Z = 'Last Name A-Z',
                LAST_NAME_Z_TO_A = 'Last Name Z-A',
                _limit = 10,
                searchOptions = {
                    filter: {"$json.fName": {"$regex": '/*'}},
                    skip: 0,
                    limit: _limit + 1 // the plus one is to check if there are any more
                },
                DEFAULT_LIST_LAYOUT = 'list-layout-1',
                DEFAULT_ITEM_LAYOUT = 'item-layout-1';

            var WidgetHome = this;
            WidgetHome.data = {};
            WidgetHome.busy = false;
            WidgetHome.sortingOptions = [
                MANUALLY,
                OLDEST_TO_NEWEST,
                NEWEST_TO_OLDEST,
                FIRST_NAME_A_TO_Z,
                FIRST_NAME_Z_TO_A,
                LAST_NAME_A_TO_Z,
                LAST_NAME_Z_TO_A
            ];
            WidgetHome.defaults = {
                DEFAULT_LIST_LAYOUT: 'list-layout-1',
                DEFAULT_ITEM_LAYOUT: 'item-layout-1',
                DEFAULT_SORT_OPTION: WidgetHome.sortingOptions[0]
            }
            var currentItemLayout,
                currentListLayout, currentSortOrder, currentBackgroundImage;
            WidgetHome.data = PeopleInfo.data;
            currentSortOrder = WidgetHome.data.content.sortBy;
            currentBackgroundImage = WidgetHome.data.design.backgroundImage;
            currentItemLayout = WidgetHome.data.design.itemLayout;
            currentListLayout = WidgetHome.data.design.listLayout;
            buildfire.messaging.onReceivedMessage = function (msg) {
                if (msg.path)
                    Location.goTo('#/');
                else
                    Location.goTo("#/people/" + msg.id);
            };

            var getSearchOptions = function (value) {
                switch (value) {
                    case OLDEST_TO_NEWEST:
                        searchOptions.sort = {"dateCreated": 1};
                        break;
                    case NEWEST_TO_OLDEST:
                        searchOptions.sort = {"dateCreated": -1};
                        break;
                    case FIRST_NAME_A_TO_Z:
                        searchOptions.sort = {"fName": 1};
                        break;
                    case FIRST_NAME_Z_TO_A:
                        searchOptions.sort = {"fName": -1};
                        break;
                    case LAST_NAME_A_TO_Z:
                        searchOptions.sort = {"lName": 1};
                        break;
                    case LAST_NAME_Z_TO_A:
                        searchOptions.sort = {"lName": -1};
                        break;
                    default :
                        searchOptions.sort = {"rank": 1};
                        break;
                }
                return searchOptions;
            };

            $scope.isDefined = function (item) {
                return item.imageUrl !== undefined && item.imageUrl !== '';
            };
            WidgetHome.safeHtml = function (html) {
                if (html)
                    return $sce.trustAsHtml(html);
            }
            WidgetHome.onUpdateFn = Buildfire.datastore.onUpdate(function (event) {
                $scope.imagesUpdated = false;
                $scope.$digest();
                if (event && event.tag) {
                    if (!WidgetHome.data.content) {
                        WidgetHome.data.content = {
                            sortBy: WidgetHome.defaults.DEFAULT_SORT_OPTION
                        }
                    }
                    if (!WidgetHome.data.design) {
                        WidgetHome.data.design = {
                            itemLayout: WidgetHome.defaults.DEFAULT_ITEM_LAYOUT,
                            listLayout: WidgetHome.defaults.DEFAULT_LIST_LAYOUT
                        }
                        currentItemLayout = WidgetHome.data.design.itemLayout;
                        currentListLayout = WidgetHome.data.design.listLayout;
                    }
                    switch (event.tag) {
                        case TAG_NAMES.PEOPLE:
                            var skip = searchOptions.skip || 0;
                            WidgetHome.busy = false;
                            WidgetHome.items = [];
                            if (searchOptions.skip && searchOptions.skip >= _limit) {
                                searchOptions.limit = _limit + 1;
                                var times = Math.floor(searchOptions.skip / _limit);
                                searchOptions.skip = 0;
                                WidgetHome.loadMore(true, Math.min(times-1,0));
                            } else {
                                searchOptions.limit = _limit + 1;
                                searchOptions.skip = 0;
                                WidgetHome.loadMore();
                            }

                            break;
                        case TAG_NAMES.PEOPLE_INFO:
                            if (event.obj) {
                                if (event.obj.design && event.obj.design.itemLayout && currentItemLayout != event.obj.design.itemLayout) {
                                    if (WidgetHome.items && WidgetHome.items.length) {
                                        var id = WidgetHome.items[0].id;
                                        Location.goTo("#/people/" + id);
                                    }
                                }
                                else if (event.obj.design && event.obj.design.listLayout && currentListLayout != event.obj.design.listLayout) {
                                    currentListLayout = event.obj.design.listLayout;
                                    WidgetHome.data.design.listLayout = event.obj.design.listLayout;
                                }

                                if (!WidgetHome.data.design)
                                    WidgetHome.data.design = {};
                                currentItemLayout = WidgetHome.data.design.itemLayout || DEFAULT_ITEM_LAYOUT;
                                /**
                                 * condition added to update the background image
                                 */
                                if (event.obj.design && event.obj.design.backgroundImage && currentBackgroundImage != event.obj.design.backgroundImage) {
                                    currentBackgroundImage = event.obj.design.backgroundImage;
                                    $('body').css('background', '#010101 url(' + Buildfire.imageLib.resizeImage(currentBackgroundImage, {
                                        width: 342,
                                        height: 770
                                    }) + ') repeat fixed top center');
                                }
                                else if (event.obj.design && !event.obj.design.backgroundImage) {
                                    currentBackgroundImage = null;
                                    $('body').css('background', 'none');
                                }

                                if (event.obj.content) {
                                    if (!WidgetHome.data)
                                        WidgetHome.data = {};
                                    WidgetHome.data.content = event.obj.content;
                                    $scope.imagesUpdated = true;
                                } else {
                                    $scope.imagesUpdated = false;
                                }
                                if (event.obj.content.sortBy && currentSortOrder != event.obj.content.sortBy) {
                                    WidgetHome.data.content.sortBy = event.obj.content.sortBy;
                                    WidgetHome.items = [];
                                    searchOptions.skip = 0;
                                    WidgetHome.busy = false;
                                    WidgetHome.loadMore();
                                }
                            }
                            break;
                    }
                    $scope.$digest();
                }
            });
            WidgetHome.noMore = false;
            WidgetHome.loadMore = function (multi, times) {
                if (WidgetHome.busy) {
                    return;
                }
                WidgetHome.busy = true;
                if (WidgetHome.data && WidgetHome.data.content.sortBy) {
                    searchOptions = getSearchOptions(WidgetHome.data.content.sortBy);
                }
                Buildfire.datastore.search(searchOptions, TAG_NAMES.PEOPLE, function (err, result) {
                    console.error('-----------WidgetHome.loadMore-------------');
                    if (err) {
                        return console.error('-----------err in getting list-------------', err);
                    }
                    if (result.length <= _limit) {// to indicate there are more
                        WidgetHome.noMore = true;
                    } else {
                        result.pop();
                        searchOptions.skip = searchOptions.skip + _limit;
                        WidgetHome.noMore = false;
                    }
                    WidgetHome.items = WidgetHome.items ? WidgetHome.items.concat(result) : result;
                    WidgetHome.busy = false;
                    if (multi && !WidgetHome.noMore && times) {
                        times = times - 1;
                        WidgetHome.loadMore(multi, times);
                    }
                    $scope.$digest();
                });
            };
            /**
             * WidgetHome.resizeImage method to resize
             * @param url
             * @param width
             * @param height
             * @returns {null}
             */
            WidgetHome.resizeImage = function (url, width, height) {
                return Buildfire.imageLib.resizeImage(url, {width: width, height: height});
            };

            $scope.$on("$destroy", function () {
                WidgetHome.onUpdateFn.clear();
            });
        }])
        // Directive for adding  Image carousel on widget home page
        .directive('imageCarousel', function () {
            return {
                restrict: 'A',
                link: function (scope, elem, attrs) {
                    scope.carousel = null;
                    scope.isCarouselInitiated = false;
                    function initCarousel() {
                        scope.carousel = null;
                        setTimeout(function () {
                            var obj = {
                                'items': 1,
                                'slideSpeed': 300,
                                'dots': true,
                                'autoplay': true
                            };

                            var totalImages = parseInt(attrs.imageCarousel, 10);
                            if (totalImages) {
                                if (totalImages > 1) {
                                    obj['loop'] = true;
                                }
                                scope.carousel = $(elem).owlCarousel(obj);
                                scope.isCarouselInitiated = true;
                            }
                            scope.$apply();
                        }, 100);
                    }

                    initCarousel();

                    scope.$watch("imagesUpdated", function (newVal, oldVal) {
                        if (newVal) {
                            if (scope.isCarouselInitiated) {
                                scope.carousel.trigger("destroy.owl.carousel");
                                scope.isCarouselInitiated = false;
                            }
                            $(elem).find(".owl-stage-outer").remove();
                            initCarousel();
                        }
                    });
                }
            }
        })
})(window.angular, window);