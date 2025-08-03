import { createTransaction } from '@/components/solana/create-transaction'
import { useConnection } from '@/components/solana/solana-provider'
import { useAuthorization } from '@/components/solana/use-authorization'
import { useMobileWallet } from '@/components/solana/use-mobile-wallet'
import { PublicKey } from '@solana/web3.js'
import { useCallback } from 'react'

// Helper function for parsing SOL amounts
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

  // Debug connection status
  console.log('Tipping hook initialized:', {
    hasConnection: !!connection,
    hasSelectedAccount: !!selectedAccount,
    accountAddress: selectedAccount?.publicKey.toString(),
    connectionEndpoint: connection?.rpcEndpoint,
  })

  const sendTip = useCallback(
    async (recipientPublicKey: string, solAmount: string) => {
      if (!selectedAccount) {
        throw new Error('Please connect your wallet first')
      }

      // Parse and validate tip amount
      const amount = parseSolAmount(solAmount)
      
      // Create public keys
      const fromPublicKey = selectedAccount.publicKey
      const toPublicKey = new PublicKey(recipientPublicKey)

      // Check if user is trying to tip themselves
      if (fromPublicKey.equals(toPublicKey)) {
        throw new Error('You cannot tip yourself')
      }

      // Check user's balance
      const balance = await connection.getBalance(fromPublicKey)
      const tipAmountLamports = amount * 1e9 // Convert SOL to lamports
      const estimatedFee = 5000 // Rough estimate for transaction fee in lamports
      const totalRequired = tipAmountLamports + estimatedFee
      
      console.log('Balance check:', {
        balance: balance / 1e9,
        tipAmount: amount,
        estimatedFee: estimatedFee / 1e9,
        totalRequired: totalRequired / 1e9,
        hasEnough: balance >= totalRequired,
      })
      
      if (balance < tipAmountLamports) {
        throw new Error(`Insufficient balance. You have ${(balance / 1e9).toFixed(4)} SOL`)
      }
      
      if (balance < totalRequired) {
        throw new Error(`Insufficient balance for tip + fees. You have ${(balance / 1e9).toFixed(4)} SOL, need ~${(totalRequired / 1e9).toFixed(4)} SOL`)
      }

      // Create the tip transaction using existing createTransaction function
      const { transaction, minContextSlot } = await createTransaction({
        publicKey: fromPublicKey,
        destination: toPublicKey,
        amount,
        connection,
      })

      // Sign and send the transaction using the mobile wallet adapter
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
        
        // Handle specific error types
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