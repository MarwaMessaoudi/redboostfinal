export class Projet {

    id?: number; // Optional, as it may not be available when creating a new projet
    name: string;
    sector: string;
    type: string;
    creationDate: string;
    description: string;
    objectives: string;
    status: string;
    globalScore: number;
    location: string;
    logoUrl: string;
    websiteUrl: string;
    foundersIds: string;
    revenue: number;
    numberOfEmployees: number;
    nbFemaleEmployees: number;
    lastUpdated: string;
    associatedSectors: string;
    technologiesUsed: string;
    fundingGoal: number;
    lastEvaluationDate: string;
  
    constructor(
      name: string,
      sector: string,
      type: string,
      creationDate: string,
      description: string,
      objectives: string = 'COURT_TERME', // Default value
      status: string = 'EN_DEVELOPPEMENT', // Default value
      globalScore: number = 0,
      location: string = '',
      logoUrl: string = '',
      websiteUrl: string = '',
      foundersIds: string = '',
      revenue: number = 0,
      numberOfEmployees: number = 0,
      nbFemaleEmployees: number = 0,
      lastUpdated: string = '',
      associatedSectors: string = '',
      technologiesUsed: string = '',
      fundingGoal: number = 0,
      lastEvaluationDate: string = ''
    ) {
      this.name = name;
      this.sector = sector;
      this.type = type;
      this.creationDate = creationDate;
      this.description = description;
      this.objectives = objectives;
      this.status = status;
      this.globalScore = globalScore;
      this.location = location;
      this.logoUrl = logoUrl;
      this.websiteUrl = websiteUrl;
      this.foundersIds = foundersIds;
      this.revenue = revenue;
      this.numberOfEmployees = numberOfEmployees;
      this.nbFemaleEmployees = nbFemaleEmployees;
      this.lastUpdated = lastUpdated;
      this.associatedSectors = associatedSectors;
      this.technologiesUsed = technologiesUsed;
      this.fundingGoal = fundingGoal;
      this.lastEvaluationDate = lastEvaluationDate;
    }
  }