import prisma from "../../prisma.js";
import { generateSlug } from "../../utils/slug.util.js";

// Get all categories. 

export const getallcategories = async () => {
    return prisma.category.findMany({
        include: {
            startups: true
        }
    });
};

// Get single category

export const getsinglecategorybyId = async (id) => {
    return prisma.category.findUnique({
        where: { id }, // find this recored: by this id. 
        include: { // also bring related data. 
            startups: true // include related startups for this category
        }
    });
};

// create category. 

export const createcategory = async (data, UserId) => {
    return prisma.category.create({
        data: {
            name: data.name,
            slug: generateSlug(data.name),
            description: data.description,
        }
    });
};

// update category. 
export const updatecategory = async (id, data, UserId, role) => {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) throw new Error("Category not found!");

    // admin and only cheaf who created by itself can only update this category. 

    if (role !== "admin" && category.createdById !== UserId) {
        throw new Error("Not authorized");
    }

    return prisma.category.update({
        where: { id },
        data: {
            name: data.name,
            description: data.description
        }
    });
};

// delete category. 

export const deletecategory = async (id, UserId, role) =>{
    const category = await prisma.category.findUnique({ where: {id}});
    if (!category) throw new Error ("Category is not found");


    // role permission. 

    if (role !== "admin" && category.createdById !== UserId){
        throw new Error ("Not authorized");
    }
    return prisma.category.delete({where: {id}});
};