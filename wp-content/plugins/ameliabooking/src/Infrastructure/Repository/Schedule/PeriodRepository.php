<?php

namespace AmeliaBooking\Infrastructure\Repository\Schedule;

use AmeliaBooking\Domain\Entity\Schedule\Period;
use AmeliaBooking\Domain\Factory\Schedule\PeriodFactory;
use AmeliaBooking\Infrastructure\Common\Exceptions\QueryExecutionException;
use AmeliaBooking\Infrastructure\Repository\AbstractRepository;

/**
 * Class PeriodRepository
 *
 * @package AmeliaBooking\Infrastructure\Repository\Schedule
 */
class PeriodRepository extends AbstractRepository
{
    const FACTORY = PeriodFactory::class;

    /**
     * @param Period $entity
     * @param int    $weekDayId
     *
     * @return bool
     * @throws QueryExecutionException
     */
    public function add($entity, $weekDayId)
    {
        $data = $entity->toArray();

        $params = [
            ':weekDayId'  => $weekDayId,
            ':startTime'  => $data['startTime'],
            ':endTime'    => $data['endTime'],
            ':locationId' => $data['locationId'] ? $data['locationId'] : null,
        ];

        try {
            $statement = $this->connection->prepare(
                "INSERT INTO {$this->table}
                (`weekDayId`, `startTime`, `endTime`, `locationId`)
                VALUES (:weekDayId, :startTime, :endTime, :locationId)"
            );

            $res = $statement->execute($params);
            if (!$res) {
                throw new QueryExecutionException('Unable to add data in ' . __CLASS__);
            }
        } catch (\Exception $e) {
            throw new QueryExecutionException('Unable to add data in ' . __CLASS__, $e->getCode(), $e);
        }

        return $this->connection->lastInsertId();
    }

    /**
     * @param Period $entity
     * @param int    $id
     *
     * @return int
     * @throws QueryExecutionException
     */
    public function update($entity, $id)
    {
        $data = $entity->toArray();

        $params = [
            ':id'         => $id,
            ':startTime'  => $data['startTime'],
            ':endTime'    => $data['endTime'],
            ':locationId' => $data['locationId'] ? $data['locationId'] : null,
        ];

        try {
            $statement = $this->connection->prepare(
                "UPDATE {$this->table}
                SET `startTime` = :startTime, `endTime` = :endTime, `locationId` = :locationId
                WHERE id = :id"
            );

            $res = $statement->execute($params);
            if (!$res) {
                throw new QueryExecutionException('Unable to save data in ' . __CLASS__);
            }

            return $res;
        } catch (\Exception $e) {
            throw new QueryExecutionException('Unable to save data in ' . __CLASS__, $e->getCode(), $e);
        }
    }
}
