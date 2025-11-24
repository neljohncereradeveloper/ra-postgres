#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */

const program = require('commander'); // For Commander v4.x
const fs = require('fs-extra');
const path = require('path');
const {
  createDomainRepositoryTemplate,
  createRepositoryImplementationTemplate,
  useCaseCreateTemplate,
  useCaseUpdateTemplate,
  useCaseFindWithFilterTemplate,
  useCaseRetrieveComboboxTemplate,
  useCaseRestoreDeleteTemplate,
  useCaseSoftDeleteTemplate,
  createCommandTemplate,
  updateCommandTemplate,
  moduleTemplate,
  controllerTemplate,
  createDtoTemplate,
  updateDtoTemplate,
} = require('./useCaseTemplate'); // Import both templates

async function generateUseCases(name, filename) {
  const folderName = filename.toLowerCase(); // Folder name based on input

  const directories = {
    domainRepositoryDir: path.join(
      process.cwd(),
      'src',
      'domain',
      'repositories',
    ),
    repositoryImplementationDir: path.join(
      process.cwd(),
      'src',
      'infrastructure',
      'database',
      'typeorm',
      'mysql',
      'repositories',
    ),
    useCasesDir: path.join(
      process.cwd(),
      'src',
      'application',
      'use-cases',
      folderName,
    ),
    commandsDir: path.join(
      process.cwd(),
      'src',
      'application',
      'commands',
      folderName,
    ),

    moduleDir: path.join(
      process.cwd(),
      'src',
      'infrastructure',
      'modules',
      folderName,
    ),

    controllerDir: path.join(
      process.cwd(),
      'src',
      'infrastructure',
      'modules',
      folderName,
      'controller',
    ),

    dtosDir: path.join(
      process.cwd(),
      'src',
      'infrastructure',
      'modules',
      folderName,
      'dto',
    ),
  };

  try {
    // --- Ensure both directories exist ---
    await Promise.all(
      Object.values(directories).map((dir) => fs.ensureDir(dir)),
    );

    // --- Generate Domain Repository ---
    const domainRepositoryFileName = `${filename.toLowerCase()}.repository.ts`;
    const domainRepositoryFilePath = path.join(
      directories.domainRepositoryDir,
      domainRepositoryFileName,
    );
    await fs.writeFile(
      domainRepositoryFilePath,
      createDomainRepositoryTemplate(name, filename),
    );
    console.log(`Created Domain Repository: ${domainRepositoryFilePath}`);

    // --- Generate Repository Implementation ---
    const implementationFileName = `${filename.toLowerCase()}.repository.impl.ts`;
    const implementationFilePath = path.join(
      directories.repositoryImplementationDir,
      implementationFileName,
    );
    await fs.writeFile(
      implementationFilePath,
      createRepositoryImplementationTemplate(name, filename),
    );
    console.log(`Created Repository Implementation: ${implementationFilePath}`);

    // --- Generate Use-Case Create ---
    const useCaseCreateFileName = `create-${filename.toLowerCase()}.use-case.ts`;
    const useCaseCreateFilePath = path.join(
      directories.useCasesDir,
      useCaseCreateFileName,
    );
    await fs.writeFile(
      useCaseCreateFilePath,
      useCaseCreateTemplate(name, filename),
    );
    console.log(`Use-Case Created: ${useCaseCreateFilePath}`);

    // --- Generate Use-Case Update ---
    const useCaseUpdateFileName = `update-${filename.toLowerCase()}.use-case.ts`;
    const useCaseUpdateFilePath = path.join(
      directories.useCasesDir,
      useCaseUpdateFileName,
    );
    await fs.writeFile(
      useCaseUpdateFilePath,
      useCaseUpdateTemplate(name, filename),
    );
    console.log(`Use-Case Updated: ${useCaseCreateFilePath}`);

    // --- Generate Use-Case Soft Delete ---
    const useCaseSoftDeleteFileName = `soft-delete-${filename.toLowerCase()}.use-case.ts`;
    const useCaseSoftDeleteFilePath = path.join(
      directories.useCasesDir,
      useCaseSoftDeleteFileName,
    );
    await fs.writeFile(
      useCaseSoftDeleteFilePath,
      useCaseSoftDeleteTemplate(name, filename),
    );
    console.log(`Use-Case Restore Deleted: ${useCaseCreateFilePath}`);

    // --- Generate Use-Case Restore Delete ---
    const useCaseRestoreDeleteFileName = `restore-delete-${filename.toLowerCase()}.use-case.ts`;
    const useCaseRestoreDeleteFilePath = path.join(
      directories.useCasesDir,
      useCaseRestoreDeleteFileName,
    );
    await fs.writeFile(
      useCaseRestoreDeleteFilePath,
      useCaseRestoreDeleteTemplate(name, filename),
    );
    console.log(`Use-Case Restore Deleted: ${useCaseCreateFilePath}`);

    // --- Generate Use-Case Retrieve combobox ---
    const useCaseRetrieveComboboxFileName = `retrieve-combobox-${filename.toLowerCase()}.use-case.ts`;
    const useCaseRetrieveComboboxFilePath = path.join(
      directories.useCasesDir,
      useCaseRetrieveComboboxFileName,
    );
    await fs.writeFile(
      useCaseRetrieveComboboxFilePath,
      useCaseRetrieveComboboxTemplate(name, filename),
    );
    console.log(`Use-Case Retrieve combobox: ${useCaseCreateFilePath}`);

    // --- Generate Use-Case Find with filters ---
    const useCaseFindWithFilterFileName = `find-with-filters-${filename.toLowerCase()}.use-case.ts`;
    const useCaseFindWithFilterFilePath = path.join(
      directories.useCasesDir,
      useCaseFindWithFilterFileName,
    );
    await fs.writeFile(
      useCaseFindWithFilterFilePath,
      useCaseFindWithFilterTemplate(name, filename),
    );
    console.log(`Use-Case Find with filters: ${useCaseCreateFilePath}`);

    // --- Generate Command Create ---
    const commandCreateFileName = `create-${filename.toLowerCase()}.command.ts`;
    const commandCreateFilePath = path.join(
      directories.commandsDir,
      commandCreateFileName,
    );
    await fs.writeFile(
      commandCreateFilePath,
      createCommandTemplate(name, filename),
    );
    console.log(`Command Created: ${commandCreateFilePath}`);

    // --- Generate Command Update ---
    const commandUpdateFileName = `update-${filename.toLowerCase()}.command.ts`;
    const commandUpdateFilePath = path.join(
      directories.commandsDir,
      commandUpdateFileName,
    );
    await fs.writeFile(
      commandUpdateFilePath,
      updateCommandTemplate(name, filename),
    );
    console.log(`Command Updated: ${commandUpdateFilePath}`);

    // --- Generate Module ---
    const moduleFileName = `${filename.toLowerCase()}.module.ts`;
    const moduleFilePath = path.join(directories.moduleDir, moduleFileName);
    await fs.writeFile(moduleFilePath, moduleTemplate(name, filename));
    console.log(`Created module: ${moduleFilePath}`);

    // --- Generate Controller ---
    const controllerFileName = `${filename.toLowerCase()}.controller.ts`;
    const controllerFilePath = path.join(
      directories.controllerDir,
      controllerFileName,
    );
    await fs.writeFile(controllerFilePath, controllerTemplate(name, filename));
    console.log(`Created controller: ${controllerFilePath}`);

    // --- Generate create dto ---
    const createDtoFileName = `create-${filename.toLowerCase()}.dto.ts`;
    const createDtoFilePath = path.join(directories.dtosDir, createDtoFileName);
    await fs.writeFile(createDtoFilePath, createDtoTemplate(name, filename));
    console.log(`Created createDto: ${createDtoFilePath}`);

    // --- Generate update dto ---
    const updateDtoFileName = `update-${filename.toLowerCase()}.dto.ts`;
    const updateDtoFilePath = path.join(directories.dtosDir, updateDtoFileName);
    await fs.writeFile(updateDtoFilePath, updateDtoTemplate(name, filename));
    console.log(`Created updateDto: ${updateDtoFilePath}`);
  } catch (error) {
    console.error('Error generating use cases:', error);
  }
}

program
  .version('1.0.0') // Commander v4.x requires a version number
  .command('generate-modules <name> <filename>')
  .description('Generate modules')
  .action((name, filename) => {
    generateUseCases(name, filename);
  });

program.parse(process.argv); // Parse arguments for Commander v4.x
