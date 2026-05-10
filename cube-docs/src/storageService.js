const STORAGE_KEY = 'cube_docs_requirements';

export const storageService = {
  saveRequirement: (requirement) => {
    const requirements = storageService.getAllRequirements();
    const index = requirements.findIndex(r => r.id === requirement.id);
    
    if (index !== -1) {
      requirements[index] = requirement;
    } else {
      requirements.push(requirement);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requirements));
    return requirement;
  },

  getAllRequirements: () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  getRequirement: (id) => {
    const requirements = storageService.getAllRequirements();
    return requirements.find(r => r.id === id);
  },

  deleteRequirement: (id) => {
    const requirements = storageService.getAllRequirements();
    const filtered = requirements.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  clearAll: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};
