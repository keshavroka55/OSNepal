import * as CategoryService from './category.service.js'


// get all categories. 

export const GetAllCategories = async (req, res) => {
    try{
        const categories = await CategoryService.getallcategories();
        res.json(categories);
    }catch (err) {
        res.status(500).json({message: err.message});
    }
};

// get single categories. 

export const GetSinglecategory = async (req, res) => {
    try {
        const categories = await CategoryService.getsinglecategorybyId (req.params.id);
        res.json(categories);
    }catch (err) {
        res.status(500).json({message: err.message});
    }
};


// create categories. 
export const CreateCategory = async (req, res) => {
    try {
        const categories = await CategoryService.createcategory(req.body, req.user.id);
        res.status(201).json(categories);
    }catch (err){
        res.status(400).json({message: err.message});
    }
};
// update categories. 

export const UpdateCategory = async (req, res) => {
    try{
        const categories = await CategoryService.updatecategory(req.params.id, req.body, req.user.id, req.user.role);
        res.json(categories);

    }catch (erro) {
        res.status(400).json({message: erro.message});

    }
};

// delete categories. 

export const DeleteCategory = async (req, res) => {
    try {
        const categories = await CategoryService.deletecategory(req.params.id, req.user.id, req.user.role);
        res.json({message: "Message Deleted successfully. "});

    }catch (err) {
        res.status(400).json({message: err.message});

    }
};