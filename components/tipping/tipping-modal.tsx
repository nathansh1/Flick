import { useAppTheme } from '@/components/app-theme'
import { useTipping } from '@/components/solana/use-tipping'
import { SolanaIcon } from '@/components/ui/solana-icon'
import { ellipsify } from '@/utils/ellipsify'
import Clipboard from '@react-native-clipboard/clipboard'
import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { ActivityIndicator, Button, IconButton, Modal, Portal, Text, TextInput } from 'react-native-paper'

interface TippingModalProps {
  visible: boolean
  onDismiss: () => void
  posterPublicKey: string
  postCaption?: string
}

export function TippingModal({ visible, onDismiss, posterPublicKey, postCaption }: TippingModalProps) {
  const { theme, spacing } = useAppTheme()
  const [tipAmount, setTipAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [transactionDetails, setTransactionDetails] = useState<{
    signature: string
    amount: number
    recipient: string
  } | null>(null)
  const { sendTip, isConnected } = useTipping()

  const handleCopy = async (text: string, label: string) => {
    try {
      await Clipboard.setString(text)
      console.log(`${label} copied to clipboard`)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const handleTip = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first')
      return
    }

    try {
      setIsProcessing(true)
      setError(null)

      console.log('Starting tip transaction:', {
        recipient: posterPublicKey,
        amount: tipAmount,
        isConnected,
      })

      const result = await sendTip(posterPublicKey, tipAmount)

      console.log('Tip transaction sent:', result)

      setTransactionDetails({
        signature: result.signature,
        amount: result.amount,
        recipient: result.to,
      })
      setShowConfirmation(true)
    } catch (err) {
      console.error('Error creating tip:', err)
      
      let errorMessage = 'Failed to create tip'
      if (err instanceof Error) {
        if (err.message.includes('cancelled')) {
          errorMessage = 'Transaction was cancelled. Please try again.'
        } else if (err.message.includes('rejected')) {
          errorMessage = 'Transaction was rejected. Please check your wallet and try again.'
        } else if (err.message.includes('timeout')) {
          errorMessage = 'Transaction timed out. Please check your connection and try again.'
        } else if (err.message.includes('insufficient')) {
          errorMessage = err.message
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDismiss = () => {
    if (!isProcessing) {
      setTipAmount('')
      setError(null)
      setShowConfirmation(false)
      setTransactionDetails(null)
      onDismiss()
    }
  }

  const handleConfirmationClose = () => {
    setShowConfirmation(false)
    setTransactionDetails(null)
    onDismiss()
  }

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleDismiss}
        contentContainerStyle={[
          styles.modal,
          { backgroundColor: theme.colors.surface }
        ]}
      >
        {showConfirmation && transactionDetails ? (
          // Confirmation Screen
                      <View>
              <View style={[styles.header, styles.centeredHeader]}>
                <Text variant="headlineSmall" style={styles.centeredTitle}>
                  ✅ Tip Sent Successfully!
                </Text>
              </View>

            <View style={styles.confirmationContent}>
                              <View style={styles.transactionDetails}>

                <Text variant="bodyMedium" style={styles.detailLabel}>
                  Amount:
                </Text>
                <Text variant="bodySmall" style={styles.amount}>
                  {transactionDetails.amount} SOL
                </Text>

                <Text variant="bodyMedium" style={styles.detailLabel}>
                  Transaction Signature:
                </Text>
                <View style={styles.detailRow}>
                  <Text variant="bodySmall" style={styles.signature}>
                    {ellipsify(transactionDetails.signature, 8)}
                  </Text>
                  <IconButton
                    icon="content-copy"
                    size={15}
                    onPress={() => handleCopy(transactionDetails.signature, 'Transaction signature')}
                    style={styles.copyButton}
                  />
                </View>

                <Text variant="bodyMedium" style={styles.detailLabel}>
                  Recipient:
                </Text>
                <View style={styles.detailRow}>
                  <Text variant="bodySmall" style={styles.recipient}>
                    {ellipsify(transactionDetails.recipient, 8)}
                  </Text>
                  <IconButton
                    icon="content-copy"
                    size={15}
                    onPress={() => handleCopy(transactionDetails.recipient, 'Recipient address')}
                    style={styles.copyButton}
                  />
                </View>

              </View>

              <Button
                mode="contained"
                onPress={handleConfirmationClose}
                style={styles.confirmationButton}
              >
                Done
              </Button>
            </View>
          </View>
        ) : (
          // Tip Form Screen
          <View>
            <View style={styles.header}>
              <SolanaIcon size={32} />
              <Text variant="headlineSmall" style={{ marginLeft: spacing.sm }}>
                Send Tip
              </Text>
            </View>

            {postCaption && (
              <Text variant="bodyMedium" style={styles.caption}>
                &ldquo;{postCaption}&rdquo;
              </Text>
            )}

            <Text variant="bodyMedium" style={styles.recipient}>
              To: {ellipsify(posterPublicKey, 8)}
            </Text>
            
            {!isConnected && (
              <Text variant="bodySmall" style={[styles.error, { color: theme.colors.error }]}>
                ⚠️ Wallet not connected. Please connect your wallet first.
              </Text>
            )}

            <TextInput
              label="Tip Amount (SOL)"
              value={tipAmount}
              onChangeText={setTipAmount}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              disabled={isProcessing}
              placeholder="0.01"
            />

            {/* Quick tip amounts */}
            <View style={styles.quickTips}>
              <Text variant="bodySmall" style={styles.quickTipsLabel}>
                Quick amounts:
              </Text>
              <View style={styles.quickTipsButtons}>
                {[0.001, 0.01, 0.1, 0.5].map((amount) => (
                  <Button
                    key={amount}
                    mode="outlined"
                    compact
                    onPress={() => setTipAmount(amount.toString())}
                    disabled={isProcessing}
                    style={styles.quickTipButton}
                  >
                    {amount} SOL
                  </Button>
                ))}
              </View>
            </View>

            {error && (
              <Text style={[styles.error, { color: theme.colors.error }]}>
                {error}
              </Text>
            )}

            <View style={styles.buttons}>
              <Button
                mode="outlined"
                onPress={handleDismiss}
                disabled={isProcessing}
                style={styles.button}
              >
                Cancel
              </Button>
                          <Button
              mode="contained"
              onPress={handleTip}
              disabled={isProcessing || !tipAmount.trim() || !isConnected}
              style={styles.button}
              icon={isProcessing ? () => <ActivityIndicator size="small" /> : undefined}
            >
              {isProcessing ? 'Processing...' : !isConnected ? 'Connect Wallet' : 'Send Tip'}
            </Button>
            </View>
          </View>
        )}
      </Modal>
    </Portal>
  )
}

const styles = StyleSheet.create({
  modal: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    color: '#4CAF50',
  },
  centeredHeader: {
    justifyContent: 'center',
  },
  centeredTitle: {
    textAlign: 'center',
    color: '#4CAF50',
  },
  caption: {
    marginBottom: 16,
    fontStyle: 'italic',
  },
  recipient: {
    marginBottom: 16,
    fontFamily: 'monospace',
    flex: 1,
  },
  input: {
    marginBottom: 16,
  },
  quickTips: {
    marginBottom: 16,
  },
  quickTipsLabel: {
    marginBottom: 8,
  },
  quickTipsButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickTipButton: {
    flex: 1,
    minWidth: 80,
  },
  error: {
    marginBottom: 16,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
  },
  // Confirmation screen styles
  confirmationContent: {
    alignItems: 'center',
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successMessage: {
    textAlign: 'center',
    color: '#4CAF50',
  },
  transactionDetails: {
    width: '100%',
    marginBottom: 24,
  },
  detailLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  signature: {
    fontFamily: 'monospace',
    marginBottom: 16,
    //padding: 8,
    borderRadius: 4,
    flex: 1,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  copyButton: {
    marginLeft: 8,
  },
  amount: {
    fontFamily: 'monospace',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  confirmationButton: {
    width: '100%',
  },
}) 