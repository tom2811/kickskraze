import React from 'react';
import { Dialog, Button, Flex, Text } from '@radix-ui/themes';

function ThankYouModal({ isOpen, onClose }) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Content style={{ maxWidth: 450 }}>
        <Dialog.Title>Thank You!</Dialog.Title>
        <Dialog.Description size="2" mb="4">
            Your order has been received. Thank you for shopping with us.
        </Dialog.Description>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray" onClick={onClose}>
              Close
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export default ThankYouModal;
