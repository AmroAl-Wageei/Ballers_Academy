<?php
/**
 * @copyright © TMS-Plugins. All rights reserved.
 * @licence   See LICENCE.md for license details.
 */

namespace AmeliaBooking\Domain\Services\Notification;

/**
 * Interface SMSAPIServiceInterface
 *
 * @package AmeliaBooking\Domain\Services\Notification
 */
interface SMSAPIServiceInterface
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
    public function sendRequest($route, $authorize, $data = null);

    /**
     * @param $data
     *
     * @return mixed
     *
     * @throws \Interop\Container\Exception\ContainerException
     */
    public function signUp($data);

    /**
     * @param $data
     *
     * @return mixed
     *
     * @throws \Interop\Container\Exception\ContainerException
     */
    public function signIn($data);

    /**
     * @return mixed
     *
     * @throws \Interop\Container\Exception\ContainerException
     */
    public function getUserInfo();

    /**
     * @param $data
     *
     * @return mixed
     *
     * @throws \Interop\Container\Exception\ContainerException
     */
    public function forgotPassword($data);

    /**
     * @param $data
     *
     * @return mixed
     *
     * @throws \Interop\Container\Exception\ContainerException
     */
    public function resetPassword($data);

    /**
     * @param $data
     *
     * @return mixed
     *
     * @throws \Interop\Container\Exception\ContainerException
     */
    public function changePassword($data);

    /**
     * @param $data
     *
     * @return mixed
     *
     * @throws \Interop\Container\Exception\ContainerException
     */
    public function getCountryPriceList($data);

    /**
     * @param $data
     *
     * @return mixed
     *
     * @throws \AmeliaBooking\Infrastructure\Common\Exceptions\NotFoundException
     * @throws \AmeliaBooking\Infrastructure\Common\Exceptions\QueryExecutionException
     * @throws \Interop\Container\Exception\ContainerException
     */
    public function testNotification($data);

    /**
     * @param $to
     * @param $body
     * @param $callbackUrl
     *
     * @return mixed
     *
     * @throws \Interop\Container\Exception\ContainerException
     */
    public function send($to, $body, $callbackUrl);

    /**
     * @param $data
     *
     * @return mixed
     *
     * @throws \Interop\Container\Exception\ContainerException
     */
    public function refreshSMSHistory($data);

    /**
     * @param $data
     *
     * @return mixed
     *
     * @throws \Interop\Container\Exception\ContainerException
     */
    public function paymentCheckout($data);

    /**
     * @param $data
     *
     * @return mixed
     *
     * @throws \Interop\Container\Exception\ContainerException
     */
    public function paymentComplete($data);

    /**
     * @param $data
     *
     * @return mixed
     *
     * @throws \Interop\Container\Exception\ContainerException
     */
    public function getPaymentHistory($data);
}
