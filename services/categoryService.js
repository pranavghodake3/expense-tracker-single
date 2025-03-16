const categoryModel = require("../models/categoryModel");
const expenseModel = require("../models/expenseModel");
const budgetModel = require("../models/budgetModel");

const getcategories = async() => {
    const categories = await categoryModel.find();

    return {
        categories,
    };
};

const getcategory = async(id) => {
    const data = await categoryModel.findById(id);

    return data;
};

const getCategoryByCondition = async(condition) => {
    const data = await categoryModel.findOne(condition);

    return data;
};

const create = async(body) => {
    const categoryModelObj = new categoryModel(body);
    const data = await categoryModelObj.save();

    return data;
};

const updatecategory = async(id, body) => {
    const data = await categoryModel.findByIdAndUpdate(id, body);

    return data;
};

const deletecategory = async(id) => {
    const data = [];
    data.push(await expenseModel.deleteMany({categoryId: id}));
    data.push(await budgetModel.deleteMany({categoryId: id}));
    data.push(await categoryModel.findByIdAndDelete(id));

    return data;
};

const createOrUpdate = async(newCategory) => {
    const data = await categoryModel.updateOne(
        { name: newCategory }, // Search condition
        { $setOnInsert: { name: newCategory } }, // Only set fields on insert
        { upsert: true } // Create if not exists
    );

    return data;
};

module.exports = {
    getcategories,
    getcategory,
    create,
    updatecategory,
    deletecategory,
    getCategoryByCondition,
    createOrUpdate,
};
