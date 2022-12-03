<?php
/**
 * @copyright © TMS-Plugins. All rights reserved.
 * @licence   See LICENCE.md for license details.
 */

namespace AmeliaBooking\Infrastructure\WP\Services\Notification;

use AmeliaBooking\Application\Services\Notification\AbstractSMSAPIService;
use AmeliaBooking\Domain\Services\Settings\SettingsService;

/**
 * Class SMSAPIServiceLite
 *
 * @package AmeliaBooking\Infrastructure\WP\Services\Notification
 */
class SMSAPIServiceLite extends AbstractSMSAPIService
{
    /**
     * @param $route
     * @param $authorize
     * @param $data
     *
     * @return mixed
     *
     * @throws \Interop\Container\Exception\ContainerException
     */
    public function sendRequest($route, $authorize, $data = null)
    {
        $params = [
            'method'   => 'GET',
            'blocking' => true,
            'timeout'  => 10
        ];

        // If there is data, request will be POST request, otherwise it will be GET
        if ($data) {
            $params['method'] = 'POST';
            $params['body'] = $data;
        }

        // If authorization is needed, send token to the request header
        if ($authorize) {
            /** @var SettingsService $settingsService */
            $settingsService = $this->getContainer()->get('domain.settings.service');

            $params['headers']['Authorization'] = "Bearer {$settingsService->getSetting('notifications', 'smsApiToken')}";
        }

        $response = wp_remote_post(AMELIA_SMS_API_URL . $route, $params);

        return !is_wp_error($response) ? json_decode($response['body']) : '';
    }
}
