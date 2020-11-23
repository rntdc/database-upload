import { getCustomRepository, getRepository, TransactionRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository'

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    const { total } = await transactionsRepository.getBalance();

    if (type == "outcome" && total < value) {
      throw new AppError("You have no balance");
    }

    let categoryName = await categoryRepository.findOne({
      where: { 
        title: category
       }
    });

    if(!categoryName) {
      categoryName = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(categoryName);
    } 

    const transaction = transactionsRepository.create({
      title,
      type,
      value,
      category: categoryName,
    });

    await transactionsRepository.save(transaction);
    
    return transaction;
  }
}

export default CreateTransactionService;
