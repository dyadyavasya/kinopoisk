<h1>About</h1>
<p>
jQuery Kinopoisk is a plugin that let you easily add to your web page movie rating informer. This informer shows
movie rating from kinopoisk.ru and imdb.com. It does not use any server side scripts. It use javascript and css files only.
</p>
<h2>Getting Started</h2>
Include jQuery and the plugin on a page.
<pre>
<code>
&lt;script src="http://yandex.st/jquery/1.7.2/jquery.min.js"&gt;&lt;/script&gt;
&lt;link rel="stylesheet" type="text/css" href="kinopoisk.min.css" /&gt;
&lt;script type="text/javascript" src="kinopoisk.min.js">&lt;/script&gt;
</code>
</pre>
Use the plugin as follows (89515 - movie id from kinopoisk.ru):
<pre>
<code>
&lt;div class="kinopoisk" data-movie="89515"&gt;&lt;/div&gt;
</code>
</pre>
That's all!
<h1>Customization</h1>
Set movie rating order (["kinopoisk", "imdb"] as default):
<pre>
<code>
&lt;div class="kinopoisk" data-movie="89515" data-order='["imdb", "kinopoisk"]'&gt;&lt;/div&gt;
</code>
</pre>
If you want only one rating:
<pre>
<code>
&lt;div class="kinopoisk" data-movie="89515" data-order='["imdb"]'&gt;&lt;/div&gt;
</code>
</pre>
Set stars' range (10 as default):
<pre>
<code>
&lt;div class="kinopoisk" data-movie="89515" data-range=5 &gt;&lt;/div&gt;
</code>
</pre>
You can use link on movie instead of movie identification.
<pre>
<code>
&lt;div class="kinopoisk" data-movie="http://www.kinopoisk.ru/film/566055" &gt;&lt;/div&gt;</code>
</pre>
Cache time is set on 1 day by default. You can change that attribute (data-cache_time) setting it in milliseconds.
Set 0 to switch off cache.
<pre>
<code>
&lt;div class="kinopoisk" data-movie="506005" data-cache_time="0"&gt;&lt;/div&gt;</code>
</pre>
<h1>API</h1>
You can use API to control plugin.
    <pre><code>
        &lt;div id="my-rating"&gt;&lt;/div&gt;
        &lt;script&gt;
            $("#my-rating").kinopoisk(
                {
                    "movie": 326,
                    "range": 5,
                    "order": ["imdb", "kinopoisk"]
                }
            );
        &lt;/script&gt;</code>
    </pre>

You can change informer template.
    <pre><code>
        &lt;div id="my-rating2"&gt;&lt;/div&gt;
        &lt;script&gt;
            $("#my-rating2").kinopoisk(
                {
                    "movie": 327,
                    "order": ["kinopoisk"],
                    "kinopoisk_template": '&lt;div&gt;' +
                        'Рейтинг: &lt;span class="kp_stars"&gt;$stars&lt;/span&gt;' +
                        '&lt;span class="kp_rating"&gt;$rating&lt;/span&gt;' +
                        '&lt;span&gt;&lt;small&gt;(Голосов: $vote)&lt;/small&gt;&lt;/span&gt;' +
                        '&lt;/div&gt;',
                }
            );
        &lt;/script&gt;</code></pre>
<h1>License</h1>
This plugin is dual licensed under the MIT and GPL2 licenses, just like jQuery itself.