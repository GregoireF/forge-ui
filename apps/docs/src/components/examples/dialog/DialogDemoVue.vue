<template>
  <div class="forge-demo">
    <DialogRoot>
      <DialogTrigger>Open Dialog</DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Update your display name and manage your account settings.
          </DialogDescription>
          <div class="forge-dialog-footer">
            <DialogClose>Cancel</DialogClose>
            <DialogClose>Save changes</DialogClose>
          </div>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  </div>
</template>

<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@forge-ui/vue";
</script>
