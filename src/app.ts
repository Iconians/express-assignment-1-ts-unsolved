import express from "express";
import { prisma } from "../prisma/prisma-instance";
import { errorHandleMiddleware } from "./error-handler";
import "express-async-errors";

const app = express();
app.use(express.json());
// All code should go below this line

app.get("/", (_req, res) => {
  res.json({ message: "Hello World!" }).status(200);
});

// inddex Endpoint
app.get("/dogs", async (_req, res) => {
  const users = await prisma.dog.findMany();
  res.json(users).status(200);
});

// show Endpoint
app.get("/dogs/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res
      .status(400)
      .send({ message: "id should be a number" });
  }
  const dog = await prisma.dog.findUnique({
    where: { id },
  });

  if (dog === null) {
    res.status(204).send({ status: 204 });
  } else {
    res.json(dog).status(200);
  }
});

// detele Endpoint
app.delete("/dogs/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res
      .status(400)
      .send({ message: "id should be a number" });
  }
  const dog = await prisma.dog.findUnique({
    where: { id },
  });

  if (dog === null) {
    res.status(204).send({ status: 204 });
  } else {
    await prisma.dog.delete({
      where: { id },
    });
    res.json(dog).status(200);
  }
});

const checkAgeForErrors = (
  age: number | string | null | undefined
) => {
  if (typeof age !== "number") {
    return "age should be a number";
  }
  return null;
};

const checkNameForErrors = (
  name: number | string | null | undefined
) => {
  if (typeof name !== "string") {
    return "name should be a string";
  }
  return null;
};

const checkBreedForErrors = (
  breed: number | string | null | undefined
) => {
  if (typeof breed !== "string") {
    return "breed should be a string";
  }
  return null;
};

const checkDescriptionForErrors = (
  description: number | string | null | undefined
) => {
  if (typeof description !== "string") {
    return "description should be a string";
  }
  return null;
};

// create Endpoint
app.post("/dogs", async (req, res) => {
  const { name, breed, age, description } = req.body;
  console.log(req.body, "req.body");
  const ageError = checkAgeForErrors(age);
  const nameError = checkNameForErrors(name);
  const breedError = checkBreedForErrors(breed);
  const descriptionError =
    checkDescriptionForErrors(description);
  const validProperties = [
    "name",
    "breed",
    "age",
    "description",
  ];
  const invalidProperties = [];

  for (const property in req.body) {
    if (!validProperties.includes(property)) {
      invalidProperties.push(property);
    }
  }

  if (invalidProperties.length > 0) {
    res.status(400).send({
      errors: invalidProperties.map(
        (prop) => `'${prop}' is not a valid key`
      ),
    });
  }

  const errors = [];

  if (ageError !== null) {
    errors.push(ageError);
  }
  if (nameError !== null) {
    errors.push(nameError);
  }
  if (breedError !== null) {
    errors.push(breedError);
  }
  if (descriptionError !== null) {
    errors.push(descriptionError);
  }
  if (errors.length > 0) {
    res.status(400).send({ errors: errors });
  }

  const createDog = await Promise.resolve()
    .then(() =>
      prisma.dog.create({
        data: {
          name,
          breed,
          age,
          description,
        },
      })
    )
    .catch(() => null);

  res.status(201).send(createDog);
});

// update Endpoint
app.patch("/dogs/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { name, breed, age, description } = req.body;
  const validProperties = [
    "name",
    "breed",
    "age",
    "description",
  ];
  const invalidProperties = [];

  for (const property in req.body) {
    if (!validProperties.includes(property)) {
      invalidProperties.push(property);
    }
  }

  if (invalidProperties.length > 0) {
    res.status(400).send({
      errors: invalidProperties.map(
        (prop) => `'${prop}' is not a valid key`
      ),
    });
  }

  const updateDog = await Promise.resolve()
    .then(() =>
      prisma.dog.update({
        where: { id },
        data: {
          name,
          breed,
          age,
          description,
        },
      })
    )
    .catch(() => null);

  res.status(201).send(updateDog);
  // }
});

// all your code should go above this line
app.use(errorHandleMiddleware);

const port = process.env.NODE_ENV === "test" ? 3001 : 3000;
app.listen(port, () =>
  console.log(`
🚀 Server ready at: http://localhost:${port}
`)
);
