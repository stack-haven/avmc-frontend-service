<script lang="ts" setup>
import type { SystemPostApi } from '#/api/system/post';

import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { createPost, updatePost } from '#/api/system/post';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emits = defineEmits(['success']);

const id = ref<string>();
const isEdit = ref(false);

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = (await formApi.getValues()) as SystemPostApi.SystemPost;
    drawerApi.lock();
    try {
      if (id.value) {
        await updatePost(id.value, values);
      } else {
        await createPost(values);
      }
      emits('success');
      drawerApi.close();
    } finally {
      drawerApi.unlock();
    }
  },
  onOpenChange(isOpen) {
    if (!isOpen) return;
    const data = drawerApi.getData<SystemPostApi.SystemPost>();
    formApi.resetForm();
    if (data?.id) {
      id.value = data.id;
      isEdit.value = true;
      formApi.setValues(data);
    } else {
      id.value = undefined;
      isEdit.value = false;
      formApi.setValues({ sort: 10 });
    }
  },
});
</script>

<template>
  <Drawer
    :title="isEdit ? $t('common.edit', [$t('system.post.name')]) : $t('common.create', [$t('system.post.name')])"
  >
    <Form />
  </Drawer>
</template>
