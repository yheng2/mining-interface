import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
})

const GAS_LIMIT = {
  STAKING: {
    DEFAULT: 200000,
    SNX: 850000,
  },
}

export const getMasterChefAddress = (sushi) => {
  return sushi && sushi.masterChefAddress
}
export const getWNewAddress = (sushi) => {
  return sushi && sushi.wethAddress
}
export const getNSTAddress = (sushi) => {
  return sushi && sushi.nstAddress
}
export const getNSPAddress = (sushi) => {
  return sushi && sushi.nspAddress
}
export const getNewNUSDTPairAddress = (sushi) => {
  return sushi && sushi.newNUSDTPairAddress
}
export const getNewMineForNodeAddress = (sushi) => {
  return sushi && sushi.newMineForNodeAddress
}
export const getNewMineSingleAddress = (sushi) => {
  return sushi && sushi.newMineSingleAddress
}
export const getMerkleDistributorAddress = (sushi) => {
  return sushi && sushi.merkleDistributorAddress
}

export const getWethContract = (sushi) => {
  return sushi && sushi.contracts && sushi.contracts.weth
}
export const getMasterChefContract = (sushi) => {
  return sushi && sushi.contracts && sushi.contracts.masterChef
}
export const getNSTContract = (sushi) => {
  return sushi && sushi.contracts && sushi.contracts.nst
}
export const getXNSTStakingContract = (sushi) => {
  return sushi && sushi.contracts && sushi.contracts.xNSTStaking
}

export const getNSPContract = (sushi) => {
  return sushi && sushi.contracts && sushi.contracts.nsp
}
export const getXNSPStakingContract = (sushi) => {
  return sushi && sushi.contracts && sushi.contracts.xNSPStaking
}

export const getNewMineForNodeContract = (sushi) => {
  return sushi && sushi.contracts && sushi.contracts.newMineForNode
}
export const getNewMineSingleContract = (sushi) => {
  return sushi && sushi.contracts && sushi.contracts.newMineSingle
}
export const getNewNUSDTPairContract = (sushi) => {
  return sushi && sushi.contracts && sushi.contracts.newNUSDTPair
}

export const getMerkleDistributorContract = (sushi) => {
  return sushi && sushi.contracts && sushi.contracts.merkleDistributor
}

export const getNSTFarms = (sushi) => {
  return sushi
    ? sushi.contracts.pools.map(
        ({
          pid,
          name,
          symbol,
          icon,
          tokenAddress,
          tokenSymbol,
          tokenContract,
          lpAddress,
          lpContract,
          iconL,
          iconR
        }) => ({
          pid,
          id: symbol,
          name,
          lpToken: symbol,
          lpTokenAddress: lpAddress,
          lpContract,
          tokenAddress,
          tokenSymbol,
          tokenContract,
          earnToken: 'nst',
          earnTokenAddress: sushi.contracts.nst.options.address,
          icon,
          iconL,
          iconR
        }),
      )
    : []
}

export const getNodeFarms = (sushi) => {
  return sushi
    ? sushi.contracts.nodePools.map(
        ({
          pid,
          name,
          symbol,
          icon,
          tokenAddress,
          tokenSymbol,
          tokenContract,
          lpAddress,
          lpContract,
          iconL,
          iconR
        }) => ({
          pid,
          id: symbol,
          name,
          lpToken: symbol,
          lpTokenAddress: lpAddress,
          lpContract,
          tokenAddress,
          tokenSymbol,
          tokenContract,
          earnToken: 'new',
          icon,
          iconL,
          iconR
        }),
      )
    : []
}

export const getPoolWeight = async (masterChefContract, pid) => {
  const { allocPoint } = await masterChefContract.methods.poolInfo(pid).call()
  const totalAllocPoint = await masterChefContract.methods
    .totalAllocPoint()
    .call()
  return new BigNumber(allocPoint).div(new BigNumber(totalAllocPoint))
}

export const getNSTEarned = async (masterChefContract, pid, account) => {
  return masterChefContract.methods.pendingNST(pid, account).call()
}

export const getNewEarned = async (newMineContract, pid, account) => {
  return newMineContract.methods.pendingNew(pid, account).call()
}

export const getNewEarnedSingle = async (newMineSingleContract, account) => {
  return newMineSingleContract.methods.pendingNew(account).call()
}

export const getNewPrice = async (newNUSDTPairContract, wnewAddress) => {
  const reserves = await newNUSDTPairContract.methods.getReserves().call()
  const token1 = await newNUSDTPairContract.methods.token1().call()

  if(token1.toLowerCase() === wnewAddress)  // token0-usdt,token1-new
    return  (new BigNumber(reserves._reserve0).div(new BigNumber(10).pow(6)))        
              .div(new BigNumber(reserves._reserve1).div(new BigNumber(10).pow(18)))
  else 
    return  (new BigNumber(reserves._reserve1).div(new BigNumber(10).pow(6)))
              .div(new BigNumber(reserves._reserve0).div(new BigNumber(10).pow(18)))
}

export const getClaimedAmount = async (merkleDistributorContract, account) => {
  return merkleDistributorContract.methods.claimedAmount(account).call()
}

// MerkleDistributor claim 
export const claim = async (merkleDistributorContract, index, account, amount, proof) => {  
  return merkleDistributorContract.methods
    .claim(index, account, new BigNumber(amount).toString(),proof)
    .send({ from: account })
    .on('transactionHash', (tx) => {
      console.log(tx)
      return tx.transactionHash
    })
}

export const getTotalLPWethValue = async (
  masterChefContract,
  wethContract,
  lpContract,
  tokenContract,
  pid,
  isGetPoolWeight
) => {
  console.log('getTotalLPWethValue========')
  console.log(lpContract.options.address)

  // Get balance of the token address
  const tokenAmountWholeLP = await tokenContract.methods
    .balanceOf(lpContract.options.address)
    .call()
  const tokenDecimals = await tokenContract.methods.decimals().call()
  // Get the share of lpContract that masterChefContract owns
  const balance = await lpContract.methods
    .balanceOf(masterChefContract.options.address)
    .call()
  // Convert that into the portion of total lpContract = p1
  const totalSupply = await lpContract.methods.totalSupply().call()
  // Get total weth value for the lpContract = w1
  const lpContractWeth = await wethContract.methods
    .balanceOf(lpContract.options.address)
    .call()
  // Return p1 * w1 * 2
  const portionLp = new BigNumber(balance).div(new BigNumber(totalSupply))
  const lpWethWorth = new BigNumber(lpContractWeth)
  const totalLpWethValue = portionLp.times(lpWethWorth).times(new BigNumber(2))
  // Calculate
  const tokenAmount = new BigNumber(tokenAmountWholeLP)
    .times(portionLp)
    .div(new BigNumber(10).pow(tokenDecimals))

  const wethAmount = new BigNumber(lpContractWeth)
    .times(portionLp)
    .div(new BigNumber(10).pow(18))
  return {
    tokenAmount,
    wethAmount,
    totalWethValue: totalLpWethValue.div(new BigNumber(10).pow(18)),
    tokenPriceInWeth: wethAmount.div(tokenAmount),
    poolWeight: isGetPoolWeight ? await getPoolWeight(masterChefContract, pid) : new BigNumber(0),
  }
}

export const approve = async (lpContract, spenderContract, account) => {
  return lpContract.methods
    .approve(spenderContract.options.address, ethers.constants.MaxUint256)
    .send({ from: account })
}

export const approveAddress = async (lpContract, address, account) => {
  return lpContract.methods
      .approve(address, ethers.constants.MaxUint256)
      .send({ from: account })
}

export const getNSTSupply = async (sushi) => {
  return new BigNumber(await sushi.contracts.nst.methods.totalSupply().call())
}

export const getXNSTSupply = async (sushi) => {
  return new BigNumber(await sushi.contracts.xNSTStaking.methods.totalSupply().call())
}

export const getXNSPSupply = async (sushi) => {
  return new BigNumber(await sushi.contracts.xNSPStaking.methods.totalSupply().call())
}

export const getNewSupplyForNode = async (sushi) => {
  return new BigNumber(await sushi.contracts.newMineForNode.methods.newSupply().call())
}

export const stake = async (masterChefContract, pid, amount, account) => {
  return masterChefContract.methods
    .deposit(
      pid,
      new BigNumber(amount).times(new BigNumber(10).pow(18)).toString(),
    )
    .send({ from: account })
    .on('transactionHash', (tx) => {
      console.log(tx)
      return tx.transactionHash
    })
}

export const stakeNewMine = async (newMineContract, pid, amount, account) => {
  return newMineContract.methods
    .deposit(
      pid,
      new BigNumber(amount).times(new BigNumber(10).pow(18)).toString(),
    )
    .send({ from: account })
    .on('transactionHash', (tx) => {
      console.log(tx)
      return tx.transactionHash
    })
}

export const stakeNewMineSingle = async (newMineSingleContract, amount, account) => {
  return newMineSingleContract.methods
    .deposit(
      new BigNumber(amount).times(new BigNumber(10).pow(18)).toString(),
    )
    .send({ from: account })
    .on('transactionHash', (tx) => {
      console.log(tx)
      return tx.transactionHash
    })
}

export const unstake = async (masterChefContract, pid, amount, account) => {
  return masterChefContract.methods
    .withdraw(
      pid,
      new BigNumber(amount).times(new BigNumber(10).pow(18)).toString(),
    )
    .send({ from: account })
    .on('transactionHash', (tx) => {
      console.log(tx)
      return tx.transactionHash
    })
}

export const unstakeNewMine = async (newMineContract, pid, amount, account) => {
  return newMineContract.methods
    .withdraw(
      pid,
      new BigNumber(amount).times(new BigNumber(10).pow(18)).toString(),
    )
    .send({ from: account })
    .on('transactionHash', (tx) => {
      console.log(tx)
      return tx.transactionHash
    })
}

export const unstakeNewMineSingle = async (newMineSingleContract, amount, account) => {
  return newMineSingleContract.methods
    .withdraw(
      new BigNumber(amount).times(new BigNumber(10).pow(18)).toString(),
    )
    .send({ from: account })
    .on('transactionHash', (tx) => {
      console.log(tx)
      return tx.transactionHash
    })
}

// harvest NST 
export const harvest = async (masterChefContract, pid, account) => {
  return masterChefContract.methods
    .deposit(pid, '0')
    .send({ from: account })
    .on('transactionHash', (tx) => {
      console.log(tx)
      return tx.transactionHash
    })
}
// harvest NEW From NewMine
export const harvestNew = async (newMineContract, pid, account) => {
  return newMineContract.methods
    .deposit(pid, '0')
    .send({ from: account })
    .on('transactionHash', (tx) => {
      console.log(tx)
      return tx.transactionHash
    })
}

// harvest NEW From NewMineSingle
export const harvestNewSingle = async (newMineSingleContract, account) => {
  return newMineSingleContract.methods
    .deposit('0')
    .send({ from: account })
    .on('transactionHash', (tx) => {
      console.log(tx)
      return tx.transactionHash
    })
}

// update lp price for community mining
export const updateNewPerLPAll = async (newMineContract, account) => {
  return newMineContract.methods
    .updateNewPerLPAll()
    .send({ from: account })
    .on('transactionHash', (tx) => {
      console.log(tx)
      return tx.transactionHash
    })
}

export const getStaked = async (masterChefContract, pid, account) => {
  try {
    const { amount } = await masterChefContract.methods
      .userInfo(pid, account)
      .call()
    return new BigNumber(amount)
  } catch {
    return new BigNumber(0)
  }
}

export const getStakedNewMine = async (newMineContract, pid, account) => {
  try {
    const { amount } = await newMineContract.methods
      .userInfo(pid, account)
      .call()
    return new BigNumber(amount)
  } catch {
    return new BigNumber(0)
  }
}

export const getStakedNewMineSingle = async (newMineSingleContract, account) => {
  try {
    const { amount } = await newMineSingleContract.methods
      .userInfo(account)
      .call()
    return new BigNumber(amount)
  } catch {
    return new BigNumber(0)
  }
}

export const redeem = async (masterChefContract, account) => {
  let now = new Date().getTime() / 1000
  if (now >= 1597172400) {
    return masterChefContract.methods
      .exit()
      .send({ from: account })
      .on('transactionHash', (tx) => {
        console.log(tx)
        return tx.transactionHash
      })
  } else {
    alert('pool not active')
  }
}

export const enter = async (contract, amount, account) => {
  debugger
  return contract.methods
      .enter(
          new BigNumber(amount).times(new BigNumber(10).pow(18)).toString(),
      )
      .send({ from: account })
      .on('transactionHash', (tx) => {
        console.log(tx)
        return tx.transactionHash
      })
}

export const leave = async (contract, amount, account) => {
  return contract.methods
      .leave(
          new BigNumber(amount).times(new BigNumber(10).pow(18)).toString(),
      )
      .send({ from: account })
      .on('transactionHash', (tx) => {
        console.log(tx)
        return tx.transactionHash
      })
}
