import React, { useState } from 'react'
import BigNumber from 'bignumber.js'
import { Button, Flex, Heading } from '@pancakeswap-libs/uikit'
import useI18n from 'hooks/useI18n'
import labo from 'config/constants/labo'
import { useHarvest } from 'hooks/useHarvest'
import { getBalanceNumber } from 'utils/formatBalance'
import styled from 'styled-components'
import useStake from '../../../../hooks/useStake'
import {usePriceCakeBusd} from "../../../../state/hooks";

interface FarmCardActionsProps {
  earnings?: BigNumber
  pid?: number
}

const Staked = styled.div`
  font-size: 10px;
  align-items: center;
  color: ${(props) => props.theme.colors.primary};
  display: flex;
  margin-top: 3px;
  justify-content: flex-end;
`

const USDStaked = styled.text`
  font-size: 15px;
  align-items: center;
  color: #8E8E8E;
  display: flex;
  margin-top: 3px;
  justify-content: flex-start;
`

const BalanceAndCompound = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
`

const HarvestAction: React.FC<FarmCardActionsProps> = ({ earnings, pid }) => {
  const TranslateString = useI18n()
  const [pendingTx, setPendingTx] = useState(false)
  const { onReward } = useHarvest(pid)
  const { onStake } = useStake(pid)
  const cakePrice = usePriceCakeBusd()

  const rawEarningsBalance = getBalanceNumber(earnings)
  const displayBalance = rawEarningsBalance.toLocaleString()
  const rawEarningsUsdBalance = getBalanceNumber(earnings.times(cakePrice), )
  const displayBalanceUsd = rawEarningsUsdBalance.toLocaleString('en-us',{ maximumFractionDigits: 2, minimumFractionDigits: 2 })

  return (
    <Flex mb='10px' justifyContent='space-between' alignItems='center'>
      <Heading color={rawEarningsBalance === 0 ? 'textDisabled' : 'text'}>
          <Staked>
              {displayBalance}
          </Staked>

          {earnings.gt(0) && <USDStaked>~${displayBalanceUsd}</USDStaked>}

      </Heading>



      <BalanceAndCompound>
        {pid === labo.pids.pidLabo ?
          <Button
            disabled={rawEarningsBalance === 0 || pendingTx}
            size='sm'
            variant='secondary'
            marginBottom='15px'
            onClick={async () => {
              setPendingTx(true)
              await onStake(rawEarningsBalance.toString())
              setPendingTx(false)
            }}
            style={{
              'borderRadius': '5px',
              'height': '40px',
              'width': '103px',
              'marginRight': '1px'
            }}
          >
            {TranslateString(999, 'Compound')}
          </Button>
          : null}
        <Button
          disabled={rawEarningsBalance === 0 || pendingTx}
          onClick={async () => {
            setPendingTx(true)
            await onReward()
            setPendingTx(false)
          }}
          style={{
            'borderRadius': '5px',
            'height': '42px',
            'width': '103px',
            'color': 'white'
          }}
        >
          {TranslateString(999, 'Settle')}
        </Button>
      </BalanceAndCompound>
    </Flex>
  )
}

export default HarvestAction
