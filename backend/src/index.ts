import express from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.get("/orders", async (req, res) => {
  const orders = await prisma.order.findMany({ include: { customer: true } });
  res.json(orders);
});

app.post("/orders", async (req, res) => {
  const { orderId, status, customerId, customer } = req.body;

  try {
    let newOrder;

    if (customerId) {
      // If customerId is provided, connect to an existing customer
      newOrder = await prisma.order.create({
        data: {
          orderId,
          status,
          customer: {
            connect: { id: customerId },
          },
        },
      });
    } else if (customer) {
      // If customer details are provided, create a new customer
      newOrder = await prisma.order.create({
        data: {
          orderId,
          status,
          customer: {
            create: customer,
          },
        },
      });
    } else {
      return res
        .status(400)
        .json({ error: "Either customerId or customer details are required" });
    }

    res.json(newOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error creating order" });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
