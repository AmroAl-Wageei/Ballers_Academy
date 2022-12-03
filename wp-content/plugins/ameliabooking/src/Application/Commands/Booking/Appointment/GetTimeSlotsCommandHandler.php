<?php

namespace AmeliaBooking\Application\Commands\Booking\Appointment;

use AmeliaBooking\Application\Commands\CommandHandler;
use AmeliaBooking\Application\Commands\CommandResult;
use AmeliaBooking\Application\Services\TimeSlot\TimeSlotService;
use AmeliaBooking\Domain\Collection\Collection;
use AmeliaBooking\Domain\Common\Exceptions\InvalidArgumentException;
use AmeliaBooking\Domain\Entity\Bookable\Service\Service;
use AmeliaBooking\Domain\Services\DateTime\DateTimeService;
use AmeliaBooking\Domain\Services\Settings\SettingsService;
use AmeliaBooking\Domain\ValueObjects\PositiveDuration;
use AmeliaBooking\Infrastructure\Common\Exceptions\QueryExecutionException;
use AmeliaBooking\Infrastructure\Services\Google\GoogleCalendarService;
use AmeliaBooking\Infrastructure\Services\Outlook\OutlookCalendarService;
use DateTimeZone;
use Exception;
use Interop\Container\Exception\ContainerException;
use Slim\Exception\ContainerValueNotFoundException;

/**
 * Class GetTimeSlotsCommandHandler
 *
 * @package AmeliaBooking\Application\Commands\Booking\Appointment
 */
class GetTimeSlotsCommandHandler extends CommandHandler
{
    /**
     * @var array
     */
    public $mandatoryFields = [
        'serviceId'
    ];

    /**
     * @param GetTimeSlotsCommand $command
     *
     * @return CommandResult
     * @throws ContainerValueNotFoundException
     * @throws ContainerException
     * @throws Exception
     * @throws InvalidArgumentException
     * @throws QueryExecutionException
     */
    public function handle(GetTimeSlotsCommand $command)
    {
        $result = new CommandResult();

        $this->checkMandatoryFields($command);

        /** @var TimeSlotService $timeSlotService */
        $timeSlotService = $this->container->get('application.timeSlot.service');

        /** @var SettingsService $settingsDS */
        $settingsDS = $this->container->get('domain.settings.service');

        $isFrontEndBooking = $command->getField('page') === 'booking' || $command->getField('page') === 'cabinet';

        /** @var Collection $services */
        $services = new Collection();

        /** @var Collection $providers */
        $providers = new Collection();

        /** @var Collection $locations */
        $locations = new Collection();

        $timeSlotService->setSlotsEntities(
            $services,
            $providers,
            $locations,
            $command->getField('serviceId'),
            $command->getField('providerIds'),
            $isFrontEndBooking
        );

        /** @var Service $service */
        $service = $services->getItem($command->getField('serviceId'));

        if ($command->getField('serviceDuration')) {
            $service->setDuration(new PositiveDuration($command->getField('serviceDuration')));
        }

        $minimumBookingTimeInSeconds = $settingsDS
            ->getEntitySettings($service->getSettings())
            ->getGeneralSettings()
            ->getMinimumTimeRequirementPriorToBooking();

        $maximumBookingTimeInDays = $settingsDS
            ->getEntitySettings($service->getSettings())
            ->getGeneralSettings()
            ->getNumberOfDaysAvailableForBooking();

        $monthsLoad = $command->getField('monthsLoad');

        $loadGeneratedPeriod = $monthsLoad &&
            !$command->getField('startDateTime') &&
            !$command->getField('endDateTime');

        $timeZone = $command->getField('queryTimeZone') ?: DateTimeService::getTimeZone()->getName();

        $queryStartDateTime = $command->getField('startDateTime') ?
            DateTimeService::getDateTimeObjectInTimeZone(
                $command->getField('startDateTime'),
                $timeZone
            )->setTimezone(DateTimeService::getTimeZone()) : null;

        $queryEndDateTime = $command->getField('endDateTime') ?
            DateTimeService::getDateTimeObjectInTimeZone(
                $command->getField('endDateTime'),
                $timeZone
            )->setTimezone(DateTimeService::getTimeZone()) : null;

        $minimumDateTime = $timeSlotService->getMinimumDateTimeForBooking(
            null,
            $isFrontEndBooking,
            $minimumBookingTimeInSeconds
        );

        $startDateTime = $queryStartDateTime ?:
            $timeSlotService->getMinimumDateTimeForBooking(
                null,
                $isFrontEndBooking,
                $minimumBookingTimeInSeconds
            );

        $endDateTime = $queryEndDateTime ?:
            $timeSlotService->getMaximumDateTimeForBooking(
                null,
                $isFrontEndBooking,
                $maximumBookingTimeInDays
            );

        $maximumDateTime = $timeSlotService->getMaximumDateTimeForBooking(
            null,
            $isFrontEndBooking,
            $maximumBookingTimeInDays
        );

        $maximumDateTime->setTimezone(new DateTimeZone($timeZone));

        if ($isFrontEndBooking) {
            $startDateTime = $startDateTime < $minimumDateTime ? $minimumDateTime : $startDateTime;

            $endDateTime = $endDateTime > $maximumDateTime ? $maximumDateTime : $endDateTime;
        }

        // set initial search period if query dates are not set
        if ($loadGeneratedPeriod) {
            $endDateTime = DateTimeService::getCustomDateTimeObject(
                $startDateTime->format('Y-m-d H:i:s')
            )->setTimezone(
                new DateTimeZone($timeZone)
            );

            $endDateTime->modify('first day of this month');

            $endDateTime->modify('+' . ($monthsLoad - 1) .  'months');

            $endDateTime->modify('last day of this month');

            $endDateTime->modify('+12days');

            $endDateTime->setTime(23, 59, 59);

            if ($isFrontEndBooking) {
                $endDateTime = $endDateTime > $maximumDateTime ?
                    DateTimeService::getDateTimeObjectInTimeZone(
                        $maximumDateTime->format('Y-m-d H:i'),
                        $timeZone
                    ) : $endDateTime;
            }

            $endDateTime->setTimezone(DateTimeService::getTimeZone());
        }

        $freeSlots = $timeSlotService->getFreeSlots(
            $service,
            $services,
            $providers,
            $locations,
            $command->getField('locationId') ?: null,
            $startDateTime,
            $endDateTime,
            $command->getField('extras'),
            $command->getField('excludeAppointmentId'),
            $command->getField('group') ? $command->getField('persons') : null,
            $isFrontEndBooking
        );

        if ($loadGeneratedPeriod) {
            // search with new period until slots are not found
            while (!$freeSlots['available'] && $endDateTime && $endDateTime <= $maximumDateTime) {
                $startDateTime = DateTimeService::getCustomDateTimeObject(
                    $endDateTime->format('Y-m-d H:i:s')
                )->setTimezone(
                    new DateTimeZone($timeZone)
                );

                $startDateTime->setTime(0, 0, 0);

                $endDateTime->modify('first day of this month');

                $endDateTime->modify('+' . ($monthsLoad - 1) .  'months');

                $endDateTime->modify('last day of this month');

                $endDateTime->modify('+12days');

                $endDateTime->setTime(23, 59, 59);

                if ($isFrontEndBooking) {
                    $endDateTime = $endDateTime > $maximumDateTime ?
                        DateTimeService::getDateTimeObjectInTimeZone(
                            $maximumDateTime->format('Y-m-d H:i'),
                            $timeZone
                        ) : $endDateTime;
                }

                $endDateTime->setTimezone(DateTimeService::getTimeZone());

                GoogleCalendarService::$providersGoogleEvents = [];

                OutlookCalendarService::$providersOutlookEvents = [];

                $freeSlots = $timeSlotService->getFreeSlots(
                    $service,
                    $services,
                    $providers,
                    $locations,
                    $command->getField('locationId') ?: null,
                    $startDateTime,
                    $endDateTime,
                    $command->getField('extras'),
                    $command->getField('excludeAppointmentId'),
                    $command->getField('group') ? $command->getField('persons') : null,
                    $isFrontEndBooking
                );

                if ($endDateTime->format('Y-m-d H:i') === $maximumDateTime->format('Y-m-d H:i') ||
                    $endDateTime > $maximumDateTime
                ) {
                    break;
                }
            }

            // search once more if first available date is in 11 days added to endDateTime (days outside calendar on frontend form)
            foreach (array_slice($freeSlots['available'], 0, 1, true) as $slotDate => $slotTimes) {
                if (substr($slotDate, 0, 7) === $endDateTime->format('Y-m')) {
                    $endDateTime->modify('last day of this month');

                    $endDateTime->modify('+12days');

                    $endDateTime->setTime(23, 59, 59);

                    if ($isFrontEndBooking) {
                        $endDateTime = $endDateTime > $maximumDateTime ?
                            DateTimeService::getDateTimeObjectInTimeZone(
                                $maximumDateTime->format('Y-m-d H:i'),
                                $timeZone
                            ) : $endDateTime;
                    }

                    GoogleCalendarService::$providersGoogleEvents = [];

                    OutlookCalendarService::$providersOutlookEvents = [];

                    $freeSlots = $timeSlotService->getFreeSlots(
                        $service,
                        $services,
                        $providers,
                        $locations,
                        $command->getField('locationId') ?: null,
                        $startDateTime,
                        $endDateTime,
                        $command->getField('extras'),
                        $command->getField('excludeAppointmentId'),
                        $command->getField('group') ? $command->getField('persons') : null,
                        $isFrontEndBooking
                    );
                }
            }
        }

        $converted = ['available' => [], 'occupied' => []];

        $isUtcResponse = ($settingsDS->getSetting('general', 'showClientTimeZone') && $isFrontEndBooking) ||
            $command->getField('timeZone');

        if ($isUtcResponse) {
            foreach (['available', 'occupied'] as $type) {
                foreach ($freeSlots[$type] as $slotDate => $slotTimes) {
                    foreach ($freeSlots[$type][$slotDate] as $slotTime => $slotTimesProviders) {
                        $convertedSlotParts = explode(
                            ' ',
                            $command->getField('timeZone') ?
                                DateTimeService::getCustomDateTimeObjectInTimeZone(
                                    $slotDate . ' ' . $slotTime,
                                    $command->getField('timeZone')
                                )->format('Y-m-d H:i') :
                                DateTimeService::getCustomDateTimeObjectInUtc(
                                    $slotDate . ' ' . $slotTime
                                )->format('Y-m-d H:i')
                        );

                        $converted[$type][$convertedSlotParts[0]][$convertedSlotParts[1]] = $slotTimesProviders;
                    }
                }
            }
        }

        $result->setResult(CommandResult::RESULT_SUCCESS);
        $result->setMessage('Successfully retrieved free slots');
        $result->setData(
            [
                'minimum' => $isUtcResponse ?
                    $minimumDateTime->setTimezone(
                        new DateTimeZone('UTC')
                    )->format('Y-m-d H:i') : $minimumDateTime->format('Y-m-d H:i'),
                'maximum'   => $isUtcResponse ?
                    $maximumDateTime->setTimezone(
                        new DateTimeZone('UTC')
                    )->format('Y-m-d H:i') : $maximumDateTime->format('Y-m-d H:i'),
                'slots'     => $converted['available'] ?: $freeSlots['available'],
                'occupied'  => $converted['occupied'] ?: $freeSlots['occupied'],
            ]
        );

        return $result;
    }
}
