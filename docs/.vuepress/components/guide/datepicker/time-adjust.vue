<template>
  <div class="example">
    <div class="flex">
      <v-date-picker v-model="customer.birthday" :model-config="modelConfig" />
      <div class="ml-4 text-sm">
        <h4 class="text-gray-700">Customer Info</h4>
        <div class="flex">
          <span class="inline-block w-16 font-semibold text-gray-600"
            >Name:</span
          ><span class="ml-2">{{ customer.name }}</span>
        </div>
        <div class="flex mt-1">
          <span class="inline-block w-16 font-semibold text-gray-600"
            >Birthday:</span
          ><span class="ml-2">{{ customer.birthday }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      customer: {
        name: 'Nathan Reyes',
        birthday: '1983-01-21T02:30:00-5:00',
      },
      modelConfig: {
        type: 'string',
        mask: 'YYYY-MM-DDTHH:mm:ssXXX',
        timeAdjust: '12:00:00', // Assign noon time to selected dates
      },
    };
  },
};
</script>
