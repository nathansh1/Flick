import { createTransaction } from '@/components/solana/create-transaction'
import { useConnection } from '@/components/solana/solana-provider'
import { useAuthorization } from '@/components/solana/use-authorization'
import { useMobileWallet } from '@/components/solana/use-mobile-wallet'
import { PublicKey } from '@solana/web3.js'
import { useCallback } from 'react'


function parseSolAmount(solAmount: string): number {
  const amount = parseFloat(solAmount)
  if (isNaN(amount) || amount <= 0) {
    throw new Error('Invalid SOL amount')
  }
  if (amount < 0.001) {
    throw new Error('Minimum tip amount is 0.001 SOL')
  }
  return amount
}

export function useTipping() {
  const connection = useConnection()
  const { selectedAccount } = useAuthorization()
  const { signAndSendTransaction } = useMobileWallet()



  const sendTip = useCallback(
    async (recipientPublicKey: string, solAmount: string) => {
      if (!selectedAccount) {
        throw new Error('Please connect your wallet first')
      }

      const amount = parseSolAmount(solAmount)
      
      const fromPublicKey = selectedAccount.publicKey
      const toPublicKey = new PublicKey(recipientPublicKey)

      if (fromPublicKey.equals(toPublicKey)) {
        throw new Error('You cannot tip yourself')
      }

      const balance = await connection.getBalance(fromPublicKey)
      const tipAmountLamports = amount * 1e9
      const estimatedFee = 5000
      const totalRequired = tipAmountLamports + estimatedFee
      
      
      if (balance < tipAmountLamports) {
        throw new Error(`Insufficient balance. You have ${(balance / 1e9).toFixed(4)} SOL`)
      }
      
      if (balance < totalRequired) {
        throw new Error(`Insufficient balance for tip + fees. You have ${(balance / 1e9).toFixed(4)} SOL, need ~${(totalRequired / 1e9).toFixed(4)} SOL`)
      }

      const { transaction, minContextSlot } = await createTransaction({
        publicKey: fromPublicKey,
        destination: toPublicKey,
        amount,
        connection,
      })

      console.log('Sending transaction with details:', {
        from: fromPublicKey.toString(),
        to: toPublicKey.toString(),
        amount,
        minContextSlot,
        transactionSize: transaction.serialize().length,
      })

      try {
        const signature = await signAndSendTransaction(transaction, minContextSlot)
        
        console.log('Transaction successful:', signature)
        
        return {
          signature,
          amount,
          from: fromPublicKey.toString(),
          to: toPublicKey.toString(),
        }
      } catch (error) {
        console.error('Transaction failed with error:', error)
        
        if (error instanceof Error) {
          if (error.message.includes('CancellationException')) {
            throw new Error('Transaction was cancelled. Please try again.')
          } else if (error.message.includes('User rejected')) {
            throw new Error('Transaction was rejected by user.')
          } else if (error.message.includes('timeout')) {
            throw new Error('Transaction timed out. Please check your connection and try again.')
          } else if (error.message.includes('insufficient')) {
            throw new Error('Insufficient balance for transaction fees. Please add more SOL.')
          }
        }
        
        throw new Error(`Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    },
    [connection, selectedAccount, signAndSendTransaction],
  )

  return {
    sendTip,
    selectedAccount,
    isConnected: !!selectedAccount,
  }
} 