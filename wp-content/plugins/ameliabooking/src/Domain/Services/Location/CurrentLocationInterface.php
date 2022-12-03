<?php
/**
 * @copyright © TMS-Plugins. All rights reserved.
 * @licence   See LICENCE.md for license details.
 */

namespace AmeliaBooking\Domain\Services\Location;

/**
 * Interface CurrentLocationInterface
 *
 * @package AmeliaBooking\Domain\Services\Location
 */
interface CurrentLocationInterface
{
    /**
     * @return string
     * @SuppressWarnings(PHPMD)
     */
    public function getCurrentLocationCountryIso();
}
