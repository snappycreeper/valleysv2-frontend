import React, { useMemo, useState, useCallback } from 'react'
import BigNumber from 'bignumber.js'
import styled from 'styled-components'
import { provider } from 'web3-core'
import { getContract } from 'utils/erc20'
import { Button, Flex, Text } from '@pancakeswap-libs/uikit'
import { Farm } from 'state/types'
import {useFarmFromPid, useFarmFromSymbol, useFarmTokensToUsd, useFarmUser, usePriceCakeBusd} from 'state/hooks'
import useI18n from 'hooks/useI18n'
import UnlockButton from 'components/UnlockButton'
import { useApprove } from 'hooks/useApprove'
import ReactTooltip from 'react-tooltip';
import labo from 'config/constants/labo'
import StakeAction from './StakeAction'
import HarvestAction from './HarvestAction'

const Action = styled.div`
  padding-top: 16px;
`
export interface FarmWithStakedValue extends Farm {
  apy?: BigNumber
}

interface FarmCardActionsProps {
  farm: FarmWithStakedValue
  ethereum?: provider
  account?: string
}

const Quote = styled.p`
      font-size: 14px;
      margin-bottom: 0px;
      color: #004871
`

const CardActions: React.FC<FarmCardActionsProps> = ({ farm, ethereum, account }) => {
  const TranslateString = useI18n()
  const [requestedApproval, setRequestedApproval] = useState(false)
  const { pid, lpAddresses, tokenAddresses, isTokenOnly, depositFeeBP } = useFarmFromPid(farm.pid)
  const { allowance, tokenBalance, stakedBalance, earnings } = useFarmUser(pid)
  const lpAddress = lpAddresses[process.env.REACT_APP_CHAIN_ID]
  const tokenAddress = tokenAddresses[process.env.REACT_APP_CHAIN_ID];
  const lpName = farm.lpSymbol.toUpperCase()
  const isApproved = account && allowance && allowance.isGreaterThan(0)
  const tokenBalanceUsd = useFarmTokensToUsd(pid, tokenBalance)
  const stakedBalanceUsd = useFarmTokensToUsd(pid, stakedBalance)

  // console.log(pid)
  // console.log(tokenBalanceUsd)
  // console.log(stakedBalanceUsd)

  const lpContract = useMemo(() => {
    if(isTokenOnly){
      return getContract(ethereum as provider, tokenAddress);
    }
    return getContract(ethereum as provider, lpAddress);
  }, [ethereum, lpAddress, tokenAddress, isTokenOnly])

  const { onApprove } = useApprove(lpContract)

  const handleApprove = useCallback(async () => {
    try {
      setRequestedApproval(true)
      await onApprove()
      setRequestedApproval(false)
    } catch (e) {
      console.error(e)
    }
  }, [onApprove])




  const renderApprovalOrStakeButton = () => {
    return isApproved ? (
      <StakeAction
          stakedBalance={stakedBalance}
          stakedBalanceUsd={stakedBalanceUsd}
          tokenBalance={tokenBalance}
          tokenBalanceUsd={tokenBalanceUsd}
          tokenName={lpName} pid={pid}
          depositFeeBP={depositFeeBP}
      />
    ) : (
      <span data-tip data-for='happyFace'>
      <Button style={{'borderRadius': ( true ? '5px' : '')}} mt="8px" fullWidth disabled={requestedApproval || labo.isLocked.unlockWalletButton} onClick={handleApprove}>
        {TranslateString(999, 'Approve Contract')}
      </Button>
      {(
        labo.isLocked.unlockWalletButton 
        ? 
      
        (
          <ReactTooltip id='happyFace' type='info'>
          <span style={{'color': 'white'}}>Do not add liquidity yet, this is a test token.</span>
          </ReactTooltip>
        )
        :
        ''
        
      )
      } 
      </span>
    )
  }

  return (
    <Action>
      <Flex>
        <Quote>{TranslateString(192, 'Pending Rewards')}</Quote>
      </Flex>
      <HarvestAction earnings={earnings} pid={pid} />
      
      <Flex>
        <Quote>{TranslateString(999, 'Staked')}</Quote>

      </Flex>
      {!account ? <UnlockButton mt="8px" fullWidth /> : renderApprovalOrStakeButton()}
    </Action>
  )
}

export default CardActions
