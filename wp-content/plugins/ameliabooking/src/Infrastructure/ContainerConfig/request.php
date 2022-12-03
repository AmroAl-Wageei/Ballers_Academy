<?php

use Slim\Http\Request;
use Slim\Http\Uri;

$entries['request'] = function (AmeliaBooking\Infrastructure\Common\Container $c) {

    $curUri = Uri::createFromEnvironment($c->get('environment'));
    $newRoute = str_replace(
        ['XDEBUG_SESSION_START=PHPSTORM&' . AMELIA_ACTION_SLUG, AMELIA_ACTION_SLUG],
        '',
        $curUri->getQuery()
    );

    $newPath = strpos($newRoute, '&') ? substr(
        $newRoute,
        0,
        strpos($newRoute, '&')
    ) : $newRoute;

    $newQuery = strpos($newRoute, '&') ? substr(
        $newRoute,
        strpos($newRoute, '&') + 1
    ) : '';

    return Request::createFromEnvironment($c->get('environment'))
       ->withUri(
           $curUri
               ->withPath($newPath)
               ->withQuery($newQuery)
       );
};
