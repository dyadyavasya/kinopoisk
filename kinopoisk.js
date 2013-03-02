/**
  * jQuery Kinopolis Plugin 0.4
  *
  * Kinopolis is a jQuery plugin that let you easily add to your web page movie rating informer. This informer shows
  * movie rating from kinopois.ru and imdb.com. It does not use any server side scripts. It use javascript and css files only.
  *
  * @name kinopolis
  * @version 0.4
  * @requires jQuery v1.5.0+
  * @author Dmitry Shamin <dmitry.shamin@gmail.com>
  * @license Dual licensed under the MIT or GPL Version 2 licenses.
  *
  * Copyright 2012-2013, Dmitry Shamin
  */
;(function( $ ) {

    /**
     * Установки по умолчанию
     *
     * @type {Object}
     */
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
                '<span class="kp_stars">$stars</span></div>',
        "cache_time" : 86400000
    };

    /**
     * Методы плагина
     *
     * @type {Object}
     */
    var methods = {

        /**
         * Инициализация плагина
         *
         * @param options {String[]} Массив с параметрами плагина
         *
         * @return {*}
         */
        init : function(options) {
            return this.each(function() {
                var $this = $(this);
                // Атрибуты data перекрывают settings, а options перекрывает data
                var params = $.extend({}, settings, $this.data(), options);
                // Если вместо идентификатора передали ссылку
                for (var i in params) {
                    if (i == 'movie') {
                        var movie = params[i].toString().split('/');
                        if (movie.length > 1) {
                            params[i] = movie[4];
                        } else {
                            params[i] = movie[0];
                        }
                    }
                }
                $this.data({'params': params}); // Записываем параметры элемента
                $this.kinopoisk('getRating');
            });
        },
        /**
         * Получение рейтинга с сайта kinopolis.ru
         *
         * @return {*}
         */
        getRating: function() {
            var el = $(this);
            var params = el.data('params');
            if (!params.movie) {
                throw 'Не указан идентификатор фильма на кинопоиске (data-movie).';
            }
            // Проверяем кеш
            var movie_xml = methods._getCache(el, params.movie);
            if (movie_xml) {
                return methods._showRating(el, movie_xml);
            } else {
                $.ajax(
                    {
                        type: 'GET',
                        url: 'http://query.yahooapis.com/v1/public/yql?q='
                                + encodeURIComponent('select * from xml where url="' + params.url + '/' + params.movie
                                + '.xml"') + '&format=xml&callback=?',
                        dataType: 'json',
                        success: function(data) {
                            movie_xml = methods._setCache(el, params.movie, data.results[0]); // Кешируем данные
                            return methods._showRating(el, movie_xml);
                        },
                        error: function(data) {
                            console.log(data);
                            $.error(data.responseText);
                        }
                    }
                );
            }
        },
        /**
         * Получение значения из кеша.
         *
         * @param el    {Object}  jQuery объект текущего элемента
         * @param movie {Integer} Идентификатор фильма
         *
         * @return {*}
         * @private
         */
        _getCache: function(el, movie) {
            var params = el.data('params');
            var timestamp = new Date().getTime();
            var cache = localStorage.getItem("movie_" + movie);
            if (!cache) {
                return false;
            } else {
                var xml_doc      = $.parseXML(cache);
                var $xml         = $(xml_doc);
                if ((timestamp - $xml.find("cache_time").text()) > params.cache_time) {
                    // Если кеш истёк, чистим его
                    localStorage.removeItem("movie_" + movie);
                    return false;
                }
            }
            return cache;
        },
        /**
         * Установка кеша
         *
         * @param el    {Object}  Объект jQuery
         * @param movie {Integer} Идентификатор фильма
         * @param data  {String}  XML с ответом сервера kinopoisk
         *
         * @return {String}
         * @private
         */
        _setCache: function(el, movie, data) {
            var params = el.data('params');
            var timestamp = new Date().getTime();
            var cache = localStorage.getItem("movie_" + movie);
            var movie_xml = "<result>" + data +  "<cache_time>" + timestamp + "</cache_time></result>";
            if (!cache) {
                localStorage.setItem("movie_" + movie, movie_xml);
            } else {
                var xml_doc      = $.parseXML(cache);
                var $xml         = $(xml_doc);
                if ((timestamp - $xml.find("cache_time").text()) > params.cache_time) {
                    // Если разница во времени более суток, то обновляем кеш
                    localStorage.setItem("movie_" + movie, movie_xml);
                } else {
                    movie_xml = cache;
                }
            }
            return movie_xml;
        },
        /**
         * Показ рейтинга
         *
         * @param el {Object}   jQuery объект
         * @param data {String} XML с ответом сервера kinopoisk
         *
         * @private
         */
        _showRating: function(el, data) {
            var params = el.data('params');
            if (!data) {
                throw 'Проверьте правильность url "' + params.url + '"';
            }
            var xml_doc      = $.parseXML(data);
            var $xml         = $(xml_doc);
            var $kp_rating   = $xml.find("kp_rating");
            var $imdb_rating = $xml.find("imdb_rating");
            // Если был указан левый movie_id
            if ($kp_rating.text() == 0 && $kp_rating.attr("num_vote") == 0) {
                return el.html('<span class="kp_container">Нет данных</span>');
            }
            $kp_rating.stars   = methods._getStar($kp_rating.text(), params.range);
            $imdb_rating.stars = methods._getStar($imdb_rating.text(), params.range);
            var ratings = {
                "kinopoisk": methods._getTemplate(params.kinopoisk_template, $kp_rating),
                "imdb": methods._getTemplate(params.imdb_template, $imdb_rating)
            };
            var text = "";
            for (var i in params.order) if (params.order.hasOwnProperty(i)) {
                if (typeof ratings[params.order[i]] != 'undefined') {
                    text += ratings[params.order[i]];
                }
            }
            return el.hide().html('<span class="kp_container">' + text + '</span>').fadeIn();
        },
        /**
         * Шаблон отображения
         *
         * @param template  {String} Шаблон
         * @param $rating   {Object} Объект рейтинга
         *
         * @return {String}
         * @private
         */
        _getTemplate: function(template, $rating) {
            return template
                .replace("$rating", $rating.text())
                .replace("$vote", $rating.attr("num_vote"))
                .replace("$stars", $rating.stars);
        },
        /**
         * Отображение звёзд
         *
         * @param rating {FLoat}   Рейтинг
         * @param range  {Integer} Диапазон звёздности
         *
         * @return {String}
         * @private
         */
        _getStar: function(rating, range) {
            var star = "";
            var round_rating = Math.round(rating * range / 10);
            for (var i = 1; i <= range; i++) {
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
                if (method.charAt(0) == "_") {
                    throw "Нельзя вызывать приватный метод";
                }
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