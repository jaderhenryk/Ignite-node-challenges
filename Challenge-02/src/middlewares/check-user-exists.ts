import { FastifyRequest, FastifyReply } from 'fastify'

export async function checkUserExists(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const userId = req.cookies.userId
  if (!userId) {
    res.status(403).send({
      error: 'Unauthorized request.',
    })
  }
}