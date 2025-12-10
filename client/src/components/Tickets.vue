<template>
  <div class="tickets">
    <div class="ticket-input">
      <PFInput v-model="ticketName" @completed="addedTicket" placeholder="Add issue title"></PFInput>
    </div>
    <div class="ticket-list" v-if="tickets && tickets.length">
      <div
          v-for="ticket in tickets"
          :key="ticket.id"
          class="ticket-item"
          :class="{ active: ticket.votingOn }"
          @click="voteOn(ticket)"
      >
        <div class="ticket-content">
          <span class="ticket-name">{{ ticket.name }}</span>
          <span v-if="ticket.score" class="ticket-score">{{ ticket.score }}</span>
        </div>
        <PFLittleButton type="delete" @clicked="deleteTicket(ticket.id)"></PFLittleButton>
      </div>
    </div>
    <div class="empty-state" v-else>
      <p>No issues yet. Add one to get started.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import PFInput from "@/components/Input.vue";
import { ref } from "vue";
import { v4 as uuidv4 } from 'uuid';
import { useTickets } from "@/composables/useTickets";
import Ticket from "@/view-models/tickets";
import PFLittleButton from "@/components/LittleButton.vue";

const { tickets, ticketUpdated } = useTickets();

let ticketName = ref('');

const addedTicket = () => {
  tickets.value.push({
    name: ticketName.value,
    voted: false,
    id: uuidv4(),
    average: '0',
    closest: '0',
    score: '0',
    votingOn: false
  });
  ticketName.value = '';
  ticketUpdated();
}

function deleteTicket(id: string) {
  tickets.value = tickets.value.filter(t => t.id !== id);
  ticketUpdated();
}

function voteOn(ticket: Ticket) {
  for (const value of tickets.value) {
    value.votingOn = false;
  }
  ticket.votingOn = true;
  ticketUpdated();
}
</script>

<style scoped lang="scss">
.tickets {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ticket-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ticket-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  background: #fff;
  border: 1px solid var(--gray-200, #EAECF0);
  border-radius: var(--radius-lg, 12px);
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: var(--gray-300, #D0D5DD);
    background: var(--gray-50, #F9FAFB);
  }

  &.active {
    border-color: var(--primary-300, #A4BCFD);
    background: var(--primary-25, #F5F8FF);
  }
}

.ticket-content {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.ticket-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--gray-700, #344054);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ticket-score {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  background: var(--primary-50, #EEF4FF);
  color: var(--primary-700, #3538CD);
  font-size: 12px;
  font-weight: 500;
  border-radius: var(--radius-full, 9999px);
}

.empty-state {
  padding: 24px;
  text-align: center;
  background: var(--gray-50, #F9FAFB);
  border: 1px dashed var(--gray-300, #D0D5DD);
  border-radius: var(--radius-lg, 12px);

  p {
    margin: 0;
    font-size: 14px;
    color: var(--gray-500, #667085);
  }
}
</style>
