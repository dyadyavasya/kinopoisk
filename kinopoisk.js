/**
 * jQuery Kinopolis Plugin 0.1
 *
 * Kinopolis is a jQuery plugin that let you easily add to your web page movie rating informer. This informer shows
 * movie rating from kinopois.ru and imdb.com. It does not use any server side scripts. It use javascript and css files only.
 *
 * @name kinopolis
 * @version 0.1
 * @requires jQuery v1.5.0+
 * @author Dmitry Shamin <dmitry.shamin@gmail.com>
 * @license Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Copyright 2012, Dmitry Shamin
 */
;(function( $ ) {

    var methods = {

        // Инициализация плагина
        init : function(options) {

            var settings = {
                "movie"  : false,
                "url"    : "http://www.kinopoisk.ru/rating/",
                "range"  : 10,
                "order"  : ["kinopoisk", "imdb"],
                "kinopoisk_template": '<div>' +
                        '<span class="kp_description">Рейтинг <a href="http://kinopoisk.ru" target="new">Кинопоиска</a>:</span>' +
                        '<span class="kp_rating" title="Проголосовало $vote">$rating</span>' +
                        '<span class="kp_stars">$stars</span></div>',
                "imdb_template": '<div>' +
                        '<span class="kp_description">Рейтинг <a href="http://imdb.com" target="new">IMDB</a>:</span>' +
                        '<span class="kp_rating" title="Проголосовало $vote">$rating</span>' +
                        '<span class="kp_stars">$stars</span></div>'
            };

            return this.each(function() {
                // Значения, заданные через options;
                if (options) {
                    $.extend(settings, options);
                }
                var el = $(this);
                // Если значения заданы через data
                var data = el.data();
                for (var i in data) {
                    if (el.data(i)) {
                        settings[i] = el.data(i);
                    }
                }
                el.kinopoisk('getRating', settings);
            });
        },
        // Получение рейтинга с сайта kinopolis.ru
        getRating: function(settings) {
            if (!settings.movie) {
                throw 'Не указан идентификатор фильма на кинопоиске (movie_id).';
            }
            var el = $(this);
            $.ajax(
                {
                    type: 'GET',
                    st: settings,
                    url: 'http://query.yahooapis.com/v1/public/yql?q='
                            + encodeURIComponent('select * from xml where url="' + settings.url + '/' + settings.movie
                            + '.xml"') + '&format=xml&callback=?',
                    dataType: 'json',
                    // Для передачи settings индивидуально в каждый вызов ajax.
                    beforeSend: function (jqXHR, settings) {
                        jqXHR.st = settings.st;
                    },
                    success: function(data, testStatus, jqXHR) {
                        return el.kinopoisk("_showRating", data, jqXHR.st);
                    },
                    error: function(data) {
                        console.log(data);
                        $.error(data.responseText);
                    }
                }
            );
        },
        // Показ рейтинга
        _showRating: function(data, settings) {
            var el = $(this);
            if (!data.results[0]) {
                throw 'Проверьте правильность url "' + settings.url + '"';
            }
            var xml_doc      = $.parseXML(data.results[0]);
            var $xml         = $(xml_doc);
            var $kp_rating   = $xml.find("kp_rating");
            var $imdb_rating = $xml.find("imdb_rating");
            // Если был указан левый movie_id
            if ($kp_rating.text() == 0 && $kp_rating.attr("num_vote") == 0) {
                return el.html('<span class="kp_container">Нет данных</span>');
            }
            $kp_rating.stars   = el.kinopoisk("_getStar", $kp_rating.text(), settings);
            $imdb_rating.stars = el.kinopoisk("_getStar", $imdb_rating.text(), settings);
            var ratings = {
                "kinopoisk": el.kinopoisk("_getTemplate", settings.kinopoisk_template, $kp_rating, settings),
                "imdb": el.kinopoisk("_getTemplate", settings.imdb_template, $imdb_rating, settings)
            };
            var text = "";
            for (var i in settings.order) {
                text += ratings[settings.order[i]];
            }
            return el.hide().html('<span class="kp_container">' + text + '</span>').fadeIn();
        },
        _getTemplate: function(template, $rating, settings) {
            return template
                .replace("$rating", $rating.text())
                .replace("$vote", $rating.attr("num_vote"))
                .replace("$stars", $rating.stars);
        },
        // получение звёзд
        _getStar: function(rating, settings) {
            var star = "";
            var round_rating = Math.round(rating * settings.range / 10);
            for (var i = 1; i <= settings.range; i++) {
                if (i <= round_rating) {
                    star += "<span>&#9733;</span>";
                } else {
                    star += "<span>&#9734;</span>";
                }
            }
            return star;
        }
    };

    $.fn.kinopoisk = function(method) {
        try {
            if (methods[method]) {
                return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
            } else if (typeof method === 'object' || ! method) {
                return methods.init.apply(this, arguments);
            } else {
                throw 'Метод ' +  method + ' не найден';
            }
        } catch(e) {
            $.error(e);
        }
    };

})(jQuery);

$(document).ready(function() {
    $(".kinopoisk").kinopoisk();
});