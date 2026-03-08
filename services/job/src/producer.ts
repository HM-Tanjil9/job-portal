import { Kafka, type Producer, type Admin } from "kafkajs";

let producer: Producer;
let admin: Admin;

export const connectKafka = async () => {
  try {
    const kafka = new Kafka({
      clientId: "auth-service",
      brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
    });
    admin = kafka.admin();
    await admin.connect();

    const topic = await admin.listTopics();

    if (!topic.includes("send-mail")) {
      await admin.createTopics({
        topics: [
          {
            topic: "send-mail",
            numPartitions: 1,
            replicationFactor: 1,
          },
        ],
      });
      console.log("✅ Topic 'send-mail' created");
    }
    await admin.disconnect();

    producer = kafka.producer();
    await producer.connect();
    console.log("✅ Connected to kafka producer");
  } catch (error) {
    console.log("❌ Failed to connect kafka");
  }
};

export const publishToTopic = async (topic: string, message: any) => {
  if (!producer) {
    console.log("kafka producer not initialized");
    return;
  }
  try {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
  } catch (error) {
    console.log("❌ Failed to publish message to kafka", error);
  }
};

export const disconnectKafka = async () => {
  if (producer) {
    producer.disconnect();
  }
};
